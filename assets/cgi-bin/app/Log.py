#!C:\Python34\python.exe
"""
The User class is used to handle all functions related to the Log
"""
import os
import sys
from math import ceil
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

        params['action'] = "" if 'action' not in params.keys() else param['action']
        returnVal = self.executeModifyQuery(query, params)
        return {'success': self.cursor.lastrowid} if 'error' not in returnVal else {'error': returnVal}

    def getAllLogs(self):
        """ get all logs """
        params = self.sanitizeParams()
        if 'page' in params.keys():  # for use with jqGrid
            ops = {
                'eq': '=',   # equal
                'ne': '<>',  # not equal
                'lt': '<',   # less than
                'le': '<=',  # less than or equal to
                'gt': '>',   # greater than
                'ge': '>=',  # greater than or equal to
                'bw': 'LIKE',  # begins with
                'bn': 'NOT LIKE',  # doesn't begin with
                'in': 'LIKE',  # is in
                'ni': 'NOT LIKE',  # is not in
                'ew': 'LIKE',  # ends with
                'en': 'NOT LIKE',  # doesn't end with
                'cn': 'LIKE',  # contains
                'nc': 'NOT LIKE'  # doesn't contain
            }

            def getWhereClause(col, oper, val, ops):
                if oper == 'bw' or oper == 'bn':
                    val += '%'
                if oper == 'ew' or oper == 'en':
                    val += '%%s' % val
                if oper == 'cn' or oper == 'nc' or oper == 'in' or oper == 'ni':
                    val = '%%s%' % val
                return " WHERE %s %s '%s' " % (col, ops[oper], val)
                # return " WHERE $col {$ops[$oper]} '$val' ";

            where = ""
            searchBool = params['_search'] if '_search' in params.keys() and params[
                '_search'] == 'true' else False
            searchField = params['searchField'] if 'searchField' in params.keys() else False
            searchOper = params['searchOper'] if 'searchOper' in params.keys() else False
            searchString = params['searchString'] if 'searchString' in params.keys() else False

            if searchBool:
                where = getWhereClause(searchField, searchOper, searchString, ops)
            params = {
                'page': int(params['page']),
                'limit': int(params['rows']),
                'sidx': params['sidx'] if 'sidx' in params.keys() else 1,
                'sord': params['sord']
            }

            # get count of records
            query = ("SELECT COUNT(*) AS count FROM log join users using(user_id) WHERE 1")
            row = self.executeQuery(query, ())
            count = row[0]['count']

            params['records'] = count
            params['total'] = ceil(count / params['limit']) if count > 0 else 0
            vPage = params['page']
            vLimit = params['limit']
            params['start'] = (vPage * vLimit) - vLimit
            query = ("SELECT log_id, username, description, action, result, detail, "
                     "DATE_FORMAT(datetime, '%y %m %d') AS datetime FROM log "
                     "join users using(user_id)")
            query += where
            query += " ORDER BY %(sidx)s %(sord)s LIMIT %(start)s, %(limit)s"
            print(query)
            params['rows'] = self.executeQuery(query, params)
            return params

        else:  # direct call
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
    info = {"_search": "true",
            'searchField': 'last_name',
            'searchString': 'Moses',
            'searchOper': 'eq',
            'filters': '',
            "rows": "5",
            "page": "1",
            "sord": "asc",
            'sidx': 'created',
            "nd": "1445875128229"}
    # info = {
    #     'function': 'VU', 'username': 'tonym415', 'password': 'password'
    # }

    """ modify user information for testing """
    # info['stuff'] = "stuff"

    print(Log(info).getAllLogs())
    # print(Log().getAllLogs())
