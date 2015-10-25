#!C:\Python34\python.exe
"""
The User class is used to handle all functions related to the Log
"""
import os
import sys
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

import lib.db2


class Log(object):

    """ for category"""
    """ initalize User object """
    _cnx = None
    _context = [__name__ == "__main__"]

    def __init__(self, *userInfo, **kwargs):
        self._cnx = lib.db2.get_connection()
        # default cursor if different cursor options are necessary another
        # will be instantiated
        self.cursor = self._cnx.cursor(buffered=True, dictionary=True)
        for dictionary in userInfo:
            for key in dictionary:
                setattr(self, "user_" + key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def sanitizeParams(self):
        return {k[5:]: v
                for k, v in self.__dict__.items()
                if k.startswith('user')}

    def newLog(self):
        """ insert new category with/without parent_id """
        query = ("INSERT INTO log(user_id, description, action, result, detail)"
                 " VALUES (%(user_id)s, %(description)s, %(action)s, %(result)s,"
                 " %(detail)s) ")
        params = self.sanitizeParams()

        returnVal = self.executeModifyQuery(query, params)
        return {'success': self.cursor.lastrowid} if 'error' not in returnVal else {'error': returnVal}

    def getAllLogs(self):
        """ get user information by name """
        query = ("SELECT log_id, username, description, action, result, detail, "
                 "datetime FROM log join users using(user_id) WHERE 1")
        return self.executeQuery(query, ())

    def executeModifyQuery(self, query, params):
        returnDict = {}
        try:
            self.cursor.execute(query, params)
            self._cnx.commit()
        except Exception as e:
            returnDict['error'] = "{}".format(e)
            returnDict['stm'] = self.cursor.statement

        return returnDict

    def executeQuery(self, query, params):
        returnDict = {}
        try:
            self.cursor.execute(query, params)
            if self.cursor.rowcount > 0:
                returnDict = self.cursor.fetchall()
            else:
                raise Exception("%s yields %s" %
                                (self.cursor.statement.replace('\n', ' ')
                                 .replace('            ', ''), self.cursor.rowcount))
        except Exception as e:
            returnDict['error'] = "{}".format(e)
            returnDict['stm'] = self.cursor.statement

        return returnDict

if __name__ == "__main__":
    info = {
        "_search": "false",
        "rows": "30",
        "page": "1",
        "sord": "asc",
        "nd": "1445665594991"
    }

    """ modify user information for testing """
    # info['stuff'] = "stuff"

    print(Log(info).getAllLogs())
