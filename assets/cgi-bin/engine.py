#!C:\Python34\python.exe -u
"""
This script handles all of the processing of the debate site
"""
import cgi
from formMockup import formMockup
import json
import cgitb
import os
import traceback

if "REQUEST_METHOD" not in os.environ:
    import sys
    sys.path.append(os.path.realpath(os.path.dirname(__file__)))
from app.Log import *
from app.User import *
from app.Category import *
from app.Question import *
from app.Game import *


cgitb.enable()


def logAction(fs):
    if 'page' in fs.keys():
        l = Log(fs).getAllLogs()
    elif 'user_id' in fs.keys():
        l = Log(fs).newLog()
    returnJson(l)


def testDep(data):
    """ test function for class functionality (not needed for production) """
    u = User(data)
    returnJson(dir(u), False)


def sendHeaders(ctype="text/html"):
    """ Sends headers """
    print("Content-Type: %s; charset=utf-8\n\n" % ctype)


def returnJson(data, toJSON=True):
    """ Takes data (string) send back return value (JSON by default)"""
    if not toJSON:
        sendHeaders()
    else:
        sendHeaders("application/json")

    print(json.dumps(data, default=str))


def showParams(fs):
    returnJson(fs)


def getAllUsers(fs):
    returnJson(User(fs).getAllUsers())


def submitUserInfo(fs):
    """ submit user info to database """
    returnObj = {'error': ''}
    if 'oper' in fs:
        uInfo = User(fs).updateUser()
    else:
        uInfo = User(fs).submitUser()

    # handle return values
    if uInfo['user_id'] != 0:
        returnObj = uInfo
    else:
        returnObj['error'] = uInfo['message']

    returnJson(returnObj)


def validateUser(fs):
    """ test function for class functionality (not needed for production) """
    user_info = {}
    if "username" in fs:
        """ create a json object noting user_info """
        u = User(fs)
        valid_user = u.isValidUser()
        if valid_user:
            user_info = u.getUser()

            # do not send back hashed password
            del user_info[0]['password']
    returnJson(user_info)


def userAvailabilityCheck(fs):
    """ test function for class functionality (not needed for production) """
    availability = {}

    if "username" in fs:
        """ create a json object noting availability """
        availability["available"] = str(User(fs).isUser())

    returnJson(availability)


def contactUs(fs):
    """ send user responses to admin """
    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        fromaddr = fs.get('email')
        toaddr = 'tonym415@gmail.com'
        msg = MIMEMultipart()
        msg['From'] = fromaddr
        msg['To'] = toaddr
        msg['Subject'] = "User Concerns from %s" % fs.get('name')

        body = fs.get('message')
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('localhost')
        text = msg.as_string()
        server.sendmail(fromaddr, toaddr, text)
        server.quit()
    except Exception as e:
        returnJson({'error': "Server Error: %s" % e})
        exit()
    # if everything worked send data back for custom confirmation
    fs['message'] = {
        'title': "Success",
        'message': """%s, your message has been sent.
                Please expect a response soon""" % fs['name']
    }
    sys.stderr.write("{}".format(locals()))
    returnJson(fs)


def modifyCategory(fs):
    """ modify fs to be properly consumed by Category() """
    # check for the existence of subcategory
    c = None
    if fs['id'] in ["deleteCategory", 'renameCategory', 'adoptCategory']:
        """ deactivates Category """
        c = Category(fs).updateCategory()
    elif fs['id'] == "createCategory":
        """ Creates new Category """
        c = Category(fs).newCategory()

    returnJson(c)


def getCategories():
    """ gathers all categories """
    returnJson({"categories": Category().getAllCategories()})


def modifyQuestion(fs):
    """ modify fs to be properly consumed by Category() """
    # check for the existence of subcategory
    q = None
    if fs['id'] in ["deleteQuestion", 'editQuestion']:
        """ deactivates Category """
        q = Question(fs).updateQuestion()
    elif fs['id'] == "createQuestion":
        """ Creates new Category """
        q = Question(fs).newQuestion()

    returnJson(q)


def getCategoryQuestionsByID(fs):
    returnObj = {}
    q = Question(fs).getQuestionsByCat()
    try:
        if 'error' not in q[0].keys():
            returnObj['questions'] = q
        else:
            returnObj = q
    except KeyError as e:
        returnObj = {'error': {
            'error': 'None',
            'msg': 'No question are available for this category'
        }}

    returnJson(returnObj)


# this will eventually be a database call
def loadCategoryQuestions(category):
    """ Loads all questions for a specific category """
    returnObj = {}
    returnObj[category] = {}
    for x in range(1, len(category) + 1):
        returnObj[category]["q%s" % x] = "%s question %d" % (category, x)

    returnJson(returnObj)


def gameFunctions(fs):
    """ gathers all categories """
    returnJson(Game(fs).addToQueue())


def doFunc(fStor):
    """ Deciphers function to run based on POSTed parameters
        Excutes the desired function with appropriate parameters
    """
    fStor = cgiFieldStorageToDict(fStor)
    funcName = fStor['function']
    """ sanitize store for use in classes """
    unused_members = ['function', '_password']
    fStor = {i: fStor[i] for i in fStor if i not in unused_members}

    if funcName == "LCQ":
        globals()['loadCategoryQuestions'](fStor['category']),
    elif funcName in ["CQ", "EQ", "DQ"]:
        globals()['modifyQuestion'](fStor)
    elif funcName in ["CC", "RC", "DC", "AC"]:
        globals()['modifyCategory'](fStor)
    elif funcName == "GQ":
        globals()['getCategoryQuestionsByID'](fStor)
    elif funcName == "GC":
        globals()['getCategories']()
    elif funcName == "GAU":
        globals()['getAllUsers'](fStor)
    elif funcName == "VU":
        globals()['validateUser'](fStor)
    elif funcName in ["SUI", "UU"]:
        globals()['submitUserInfo'](fStor)
    elif funcName == "SP":
        globals()['showParams'](fStor)
    elif funcName == "TD":
        globals()['testDep'](fStor)
    elif funcName == "UAC":
        globals()['userAvailabilityCheck'](fStor)
    elif funcName == "SGP":
        globals()['gameFunctions'](fStor)
    elif funcName == "CU":
        globals()['contactUs'](fStor)
    elif funcName in ["LOG", 'GL']:
        globals()['logAction'](fStor)
    else:
        globals()['showParams'](fStor)


def cgiFieldStorageToDict(fieldstorage):
    """ Get a plain dictionary from cgi.FieldStorage """
    params = {}
    for key in fieldstorage.keys():
        params[key] = fieldstorage.getvalue(key)
    return params


def main():
    """ Self test this module using hardcoded data """
    info = {'id': 'deleteCategory', 'd_Category': 3,
            'd_parentCategoryChk': 'on', 'd_subCategory[]': 4, 'd_subCategory[]': 19}

    form = formMockup(function="GQ", category_id="2")
    """ valid user in db (DO NOT CHANGE: modify below)"""
    # form = formMockup(function="SUI", confirm_password="password",
    #                   first_name="Antonio", paypal_account="tonym415",
    #                   password="password", email="tonym415@gmail",
    #                   last_name="Moses", username="tonym415")
    doFunc(form)

if "REQUEST_METHOD" in os.environ:
    fs = cgi.FieldStorage()
    if 'function' in fs.keys():
        # run function depending on given values
        doFunc(fs)
else:
    main()
