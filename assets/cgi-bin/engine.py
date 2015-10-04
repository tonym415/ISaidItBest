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
        sendHeaders("text/json")

    print(json.dumps(data))


def showParams(fs):
    returnJson(fs)


def submitUserInfo(fs):
    """ submit user info to database """
    returnObj = {'error': ''}
    uInfo = User(fs).submitUser()
    print(uInfo)
    if uInfo['user_id'] == 0:
        returnObj['error'] = uInfo['message']
    else:
        returnObj = uInfo
    returnJson(returnObj)


def userAvailabilityCheck(fs):
    """ test function for class functionality (not needed for production) """
    availability = {}

    if "username" in fs:
        """ create a json object noting availability """
        availability["available"] = str(User(fs).isUser())

    # print(json.dumps(availability))
    returnJson(availability)


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
    funcName = fStor['function']

    """ sanitize store for use in classes """
    unused_members = ['function', '_password']
    fStor = {i: fStor[i] for i in fStor if i not in unused_members}

    if funcName == "LCQ":
        globals()['loadCategoryQuestions'](fStor['category']),
    elif funcName == "SUI":
        globals()['submitUserInfo'](fStor)
    elif funcName == "SP":
        globals()['showParams'](fStor)
    elif funcName == "TD":
        globals()['testDep'](fStor)
    elif funcName == "UAC":
        globals()['userAvailabilityCheck'](fStor)
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
    # form = formMockup(function="SUI", username="test_user1")
    """ valid user in db (DO NOT CHANGE: modify below)"""
    form = formMockup(function="SUI", confirm_password="password",
                      first_name="Antonio", paypal_account="tonym415",
                      password="password", email="tonym415@gmail",
                      last_name="Moses", username="tonym415")
    doFunc(form)

if "REQUEST_METHOD" in os.environ:
    fs = cgi.FieldStorage()
    if 'function' in fs.keys():
        # run function depending on given values
        doFunc(fs)
else:
    main()
