#!C:\Python34\python.exe -u

import cgi
# import sys
# import json
import cgitb

cgitb.enable()

fs = cgi.FieldStorage()
#this line is compulsory to separate body from header in http respons
print("Content-Type: text/plain\n\n")
print("IT Worked")
