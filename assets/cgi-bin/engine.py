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


def setParams(fs):
    sendHeaders()
    print("<p> %s </p" % fs.getvalue('function'))


# this will eventually be a database call
def loadCategoryQuestions(category):
    """ Loads all questions for a specific category """
    returnVals = []
    returnObj = {}
    returnObj[category] = {}
    for x in range(1, len(category) + 1):
        returnObj[category]["q%s" % x] = "%s question %d" % (category, x)

    returnVals.append(returnObj)
    sendHeaders()
    print(json.dumps(returnVals))


def getFunc(fStor):
    """ Deciphers function to run based on POSTed parameters """
    """ Returns function name and signature to be executed """
    funcName = fStor.getvalue('function')
    return {
       "LCQ" : ("%s('%s')" % 
                       ("loadCategoryQuestions", fStor.getvalue('category')))
    }.get(funcName,"setParams(%s)" % fStor)   


def main():
    """ Self test this module using hardcoded data """
    form = formMockup(function="LCQ", category="Political")
    func = getFunc(form)
    # eval(func)
    locals()[func]()

if "REQUEST_METHOD" in os.environ: 
    fs = cgi.FieldStorage()
    if 'function' in fs.keys():
        # decide which function to run
        func = getFunc(fs)
        locals()[func]
else:
    main()
