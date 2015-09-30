#!C:\Python34\python.exe -u
"""
This script handles all of the processing of the debate site
"""
import cgi
import os
from formMockup import formMockup
import json
import cgitb

cgitb.enable()


def sendHeaders():
    """ Sends headers """
    print("Content-Type: text/html\n\n")


def returnValue(data):
    """ After function returns string send back return value """
    sendHeaders()
    print(json.dumps(data))


def setParams(fs):
    returnValue("<p> %s </p" % fs['function'])


def submitUserInfo(fs):
    """ submit user info to database """
    returnValue("<p> %s </p" % fs)


# this will eventually be a database call
def loadCategoryQuestions(category):
    """ Loads all questions for a specific category """
    returnVals = []
    returnObj = {}
    returnObj[category] = {}
    for x in range(1, len(category) + 1):
        returnObj[category]["q%s" % x] = "%s question %d" % (category, x)

    returnVals.append(returnObj)
    returnValue(returnVals)


def doFunc(fStor):
    """ Deciphers function to run based on POSTed parameters
        Excutes the desired function with appropriate parameters
    """
    fStor = cgiFieldStorageToDict(fStor)
    funcName = fStor['function']
    if funcName == "LCQ":
        globals()['loadCategoryQuestions'](fStor['category']),
    elif funcName == "SUI":
        globals()['submitUserInfo'](fStor)
    elif funcName == "SP":
        globals()['setParams'](fStor)
    else:
        globals()['setParams'](fStor)


def cgiFieldStorageToDict(fieldstorage):
    """ Get a plain dictionary from cgi.FieldStorage """
    params = {}
    for key in fieldstorage.keys():
        params[key] = fieldstorage.getvalue(key)
    return params


def main():
    """ Self test this module using hardcoded data """
    form = formMockup(function="SUI", category="Political")
    doFunc(form)

if "REQUEST_METHOD" in os.environ:
    fs = cgi.FieldStorage()
    if 'function' in fs.keys():
        # run function depending on given values
        doFunc(fs)
else:
    main()
