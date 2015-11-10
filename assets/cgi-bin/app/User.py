#!C:\Python34\python.exe
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
import json
from math import ceil
from passlib.hash import pbkdf2_sha256
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

import lib.db2


class User(object):

    """ for User"""
    """ initalize User object """
    _cnx = None
    _context = [__name__ == "__main__"]

    def __init__(self, *userInfo, **kwargs):
        self._cnx = lib.db2.get_connection()
        self.cursor = self._cnx.cursor(buffered=True, dictionary=True)
        for dictionary in userInfo:
            for key in dictionary:
                # print('Key: %s' % key)
                setattr(self, "user_" + key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def sanitizeParams(self):
        return {k[5:]: v
                for k, v in self.__dict__.items()
                if k.startswith('user')}

    def getAllUsers(self):
        """ get user information by name """
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

            def getWhereClause(col, oper, val):
                if oper == 'bw' or oper == 'bn':
                    val += '%'
                if oper == 'ew' or oper == 'en':
                    val += '%' + val
                if oper == 'cn' or oper == 'nc' or oper == 'in' or oper == 'ni':
                    val = '%' + val + '%'
                return "  %s %s '%s' " % (col, ops[oper], val)

            where = ""
            searchBool = params['_search'] if '_search' in params.keys() and params[
                '_search'] == 'true' else False
            searchField = params['searchField'] if 'searchField' in params.keys() else False
            searchOper = params['searchOper'] if 'searchOper' in params.keys() else False
            searchString = params['searchString'] if 'searchString' in params.keys() else False
            filters = params['filters'] if 'filters' in params.keys() else False

            params = {
                'page': int(params['page']),
                'limit': int(params['rows']),
                'sidx': params['sidx'] if 'sidx' in params.keys() else 1,
                'sord': params['sord']
            }
            if searchBool:
                where += " WHERE "
                if searchField:
                    where += getWhereClause(searchField, searchOper,
                                            searchString)
                elif filters:   # filter options
                    buildwhere = ""

                    # handle string value of cgi var
                    if isinstance(filters, str):
                        filters = json.loads(filters)

                    rules = filters['rules']
                    for idx in range(len(rules)):
                        field = rules[idx]['field']
                        op = rules[idx]['op']
                        data = rules[idx]['data']

                        if idx > 0:
                            buildwhere = filters['groupOp']
                            buildwhere += getWhereClause(field, op, data)
                        else:
                            buildwhere += getWhereClause(field, op, data)
                        where += buildwhere

            # get count of records
            query = ("SELECT COUNT(*) as count FROM  users "
                     "INNER JOIN roles USING(role_id) ")
            query += where
            row = self.executeQuery(query, ())
            count = row[0]['count']

            params['records'] = count
            params['total'] = ceil(count / params['limit']) if count > 0 else 0
            vPage = params['page']
            vLimit = params['limit']
            params['start'] = (vPage * vLimit) - vLimit
            query = ("SELECT user_id, first_name,last_name, email, "
                     "username, password , credit , wins, losses, "
                     "paypal_account, roles.role, "
                     "DATE_FORMAT(created, '%d %b %Y %T') as created, active  "
                     "FROM  users INNER JOIN roles USING(role_id) ")
            query += where
            query += " ORDER BY %(sidx)s %(sord)s LIMIT %(start)s, %(limit)s"
            params['rows'] = self.executeQuery(query, params)
            return params
        else:
            query = ("SELECT user_id, first_name,last_name, email,"
                     "username, password , credit , wins, losses,"
                     "paypal_account, roles.role, "
                     "DATE_FORMAT(created, '%d %b %Y %T') as created, active  "
                     "FROM  users INNER JOIN roles USING(role_id) WHERE 1")
            return self.executeQuery(query, ())

    def getUser(self):
        """ get user information by name """
        # if no user is found by the given name return empty dictionary
        query = """SELECT  user_id ,  first_name , last_name , email ,
                username, credit, wins, losses, paypal_account , password,
                created, role,  active  FROM  users JOIN roles USING(role_id) WHERE username = %s"""
        return self.executeQuery(query, (self.user_username,))

    def updateUser(self):
        """ update user info """
        params = self.sanitizeParams()
        # rename id key for query string
        if 'id' in params.keys():
            params['user_id'] = params.pop('id')
            setattr(self, "user_user_id", params['user_id'])

        query = "UPDATE users SET"
        if params['oper'] == 'edit':
            for idx, k in enumerate(params):
                # remove unnecessary keys
                if k == 'oper' or k == 'user_id':
                    continue
                elif k == 'role':
                    # correct column name
                    k = 'role_id'
                    query += " %s = %r," % (k, params['role'])
                    continue
                elif k == 'active':
                    # correct values for columns
                    params[k] = (0, 1)[params[k] == "Yes"]
                query += " %s = %r," % (k, params[k])

            # remove trailing comma
            query = query[:-1] + " WHERE user_id = %(user_id)s"
        if params['oper'] == 'del':
            query += ' active = 0 WHERE user_id = %(user_id)s'

        self.executeModifyQuery(query, params)
        return {'user_id': self.cursor.lastrowid, 'stm': self.cursor.statement}

    def submitUser(self):
        """ inserts user info into the database """
        returnObj = {"user_id": 0}
        query = ("INSERT INTO  users"
                 "(first_name ,  last_name , email ,  username ,  password ,"
                 "paypal_account) VALUES (%(first_name)s, %(last_name)s,"
                 "%(email)s,%(username)s, %(password)s, %(paypal_account)s)")

        # extract only user info from class __dict__
        query_params = self.sanitizeParams()
        # hash password
        query_params['password'] = pbkdf2_sha256.encrypt(
            query_params['password'], rounds=200000, salt_size=16)

        try:
            self.executeModifyQuery(query, query_params)
            uid = self.cursor.lastrowid
            # add user_id to current instance
            setattr(self, "user_user_id", uid)
            returnObj = self.getUser()
        except lib.db2._connector.IntegrityError as err:
            returnObj['message'] = "Error: {}".format(err)

        return returnObj

    def isValidUser(self):
        """ determine if user is valid based on username/password """
        userInfo = self.getUser()[0]
        if 'error' in userInfo:
            validUser = False
        else:
            # test given password against database password
            hashed_pw = userInfo['password']
            validUser = pbkdf2_sha256.verify(self.user_password, hashed_pw)

        return validUser

    def isUser(self):
        """ checking for username availability """
        query = """SELECT  username  FROM  users  WHERE username = %s"""
        self.executeQuery(query, (self.user_username,))
        """ if number of rows fields is bigger them 0 that means it's NOT
         available returning 0, 1 otherwise
         """
        return (0, 1)[self.cursor.rowcount > 0]

    def profileUpdate(self):
        params = self.sanitizeParams()
        return params['uploader']

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
    info = {"active": "Yes",
            "credit": "65.00",
            "email": "32@sa.com",
            "first_name": "Antonio",
            "id": "50",
            "last_name": "Moses",
            "oper": "edit",
            "role": "2",
            "username": "ass"}
    # """ valid user in db (DO NOT CHANGE: modify below)"""
    # info = {"confirm_password": "password", "first_name":
    #         "Antonio", "paypal_account": "tonym415", "password":
    #         "password", "email": "tonym415@gmail.com", "last_name":
    #         "Moses", "username": "tonym415"}

    """ modify user information for testing """
    # info['username'] = "bob"
    # info['password'] = "userpass"

    """ remove  from data dict """
    u_info = {i: info[i]
              for i in info if i != 'function' and '_password' not in i}
    # print(info)

    print(User(info).updateUser())
    # u = User(u_info)
    # print(u.getUser())
