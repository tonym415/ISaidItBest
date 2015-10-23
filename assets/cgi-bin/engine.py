#!C:\Python34\python.exe -u
"""
This script handles all of the processing of the debate site
"""
import cgi
from formMockup import formMockup
import json
import cgitb
import os

if "REQUEST_METHOD" not in os.environ:
    import sys
    sys.path.append(os.path.realpath(os.path.dirname(__file__)))
from app.User import *
from app.Category import *


cgitb.enable()


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


def getAllUsers():
    users = {"records": User().getAllUsers()}
    returnJson(users)


def submitUserInfo(fs):
    """ submit user info to database """
    returnObj = {'error': ''}
    uInfo = User(fs).submitUser()
    if uInfo['user_id'] == 0:
        returnObj['error'] = uInfo['message']
    else:
        returnObj = uInfo

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

            # prune unnecessary info
            del user_info['password']

    returnJson(user_info)


def userAvailabilityCheck(fs):
    """ test function for class functionality (not needed for production) """
    availability = {}

    if "username" in fs:
        """ create a json object noting availability """
        availability["available"] = str(User(fs).isUser())

    # print(json.dumps(availability))
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


def createCategory(fs):
    """ Creates new Category """
    c = Category(fs).newCategory()
    returnJson(c)


def getCategories():
    """ gathers all categories """
    returnObj = {"categories": Category().getAllCategories()}
    returnJson(returnObj)


# this will eventually be a database call
def loadCategoryQuestions(category):
    """ Loads all questions for a specific category """
    returnObj = {}
    returnObj[category] = {}
    for x in range(1, len(category) + 1):
        returnObj[category]["q%s" % x] = "%s question %d" % (category, x)

    returnJson(returnObj)


def doFunc(fStor):
    """ Deciphers function to run based on POSTed parameters
        Excutes the desired function with appropriate parameters
    """
    fStor = cgiFieldStorageToDict(fStor)
    print(fStor)
    funcName = fStor['function']

    """ sanitize store for use in classes """
    unused_members = ['function', '_password']
    fStor = {i: fStor[i] for i in fStor if i not in unused_members}

    if funcName == "LCQ":
        globals()['loadCategoryQuestions'](fStor['category']),
    elif funcName == "CC":
        globals()['createCategory'](fStor)
    elif funcName == "GC":
        globals()['getCategories']()
    elif funcName == "GAU":
        globals()['getAllUsers']()
    elif funcName == "VU":
        globals()['validateUser'](fStor)
    elif funcName == "SUI":
        globals()['submitUserInfo'](fStor)
    elif funcName == "SP":
        globals()['showParams'](fStor)
    elif funcName == "TD":
        globals()['testDep'](fStor)
    elif funcName == "UAC":
        globals()['userAvailabilityCheck'](fStor)
    elif funcName == "CU":
        globals()['contactUs'](fStor)
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
    info = {'form_id': 'createCategory', 'c_Category': "",
            'function': 'CC'}
    form = formMockup(function="CC", form_id="createCategory", c_Category=None)
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
