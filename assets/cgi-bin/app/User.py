#!C:\Python34\python.exe -m
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
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
        for dictionary in userInfo:
            for key in dictionary:
                setattr(self, "user_" + key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def getAllUsers(self):
        """ get user information by name """
        query = """SELECT USER_ID, FIRST_NAME,LAST_NAME, EMAIL
                USERNAME ,  PASSWORD ,  CREDIT ,  WINS ,  LOSSES ,
                 PAYPAL_ACCOUNT ,  Created ,  Active  FROM  users  WHERE 1
            """
        cursor = self._cnx.cursor(buffered=True)
        cursor.execute(query)
        if cursor.rowcount > 0:
            rows = cursor.fetchall()
            for row in rows:
                pass  # print(row)
        else:
            pass  # print("No user by the name '%s'" % self.username)

    def getUser(self):
        """ get user information by name """
        # if no user is found by the given name return empty dictionary
        returnDict = {}
        query = """SELECT  USER_ID ,  FIRST_NAME , LAST_NAME , EMAIL ,
                USERNAME, CREDIT ,  WINS ,  LOSSES ,  PAYPAL_ACCOUNT ,
                PASSWORD, CREATED ,  ACTIVE  FROM  users  WHERE USERNAME = %s"""
        cursor = self._cnx.cursor(buffered=True, dictionary=True)
        try:
            cursor.execute(query, (self.user_username,))
            if cursor.rowcount > 0:
                returnDict = cursor.fetchone()
            else:
                raise Exception("%s yields %s" %
                               (cursor.statement.replace('\n', ' ')
                                .replace('            ', ''), cursor.rowcount))
        except Exception as e:
            returnDict['error'] = "{}".format(e)

        return returnDict

    def submitUser(self):
        """ inserts user info into the database """
        returnObj = {"USER_ID": 0}
        query = ("INSERT INTO  users"
                 "(FIRST_NAME ,  LAST_NAME , EMAIL ,  USERNAME ,  PASSWORD ,"
                 "PAYPAL_ACCOUNT) VALUES (%(first_name)s, %(last_name)s,"
                 "%(email)s,%(username)s, %(password)s, %(paypal_account)s)")

        # extract only user info from class __dict__
        query_params = {k[5:]: v
                        for k, v in self.__dict__.items()
                        if k.startswith('user')}
        # hash password
        query_params['password'] = pbkdf2_sha256.encrypt(
            query_params['password'], rounds=200000, salt_size=16)

        try:
            cursor = self._cnx.cursor(buffered=True)
            cursor.execute(query, query_params)
            self._cnx.commit()
            uid = cursor.lastrowid
            # add user_id to current instance
            setattr(self, "user_user_id", uid)
            returnObj = self.getUser()
        except lib.db2._connector.IntegrityError as err:
            returnObj['message'] = "Error: {}".format(err)

        return returnObj

    def isValidUser(self):
        """ determine if user is valid based on username/password """
        userInfo = self.getUser()
        print(userInfo)
        if 'error' not in userInfo:
            print(userInfo)
            # test given password against database password
            hashed_pw = userInfo['PASSWORD']
            # print("id: %s, inst: %s, hash: %s" % (self.user_user_id,
                                                # self.user_password, hashed_pw))
            validUser = pbkdf2_sha256.verify(self.user_password, hashed_pw)
            # print("Valid: " + str(validUser))
        else:
            validUser = False

        return validUser

    def isUser(self):
        """ checking for username availability """
        query = """SELECT  USERNAME  FROM  users  WHERE USERNAME = %s"""
        cursor = self._cnx.cursor(buffered=True)
        cursor.execute(query, (self.user_username,))
        """ if number of rows fields is bigger them 0 that means it's NOT
         available returning 0, 1 otherwise
         """
        # print("(%s : retured %d rows)\n" % (cursor.statement, cursor.rowcount))

        return (0, 1)[cursor.rowcount > 0]

if __name__ == "__main__":
    info = {}
    # """ valid user in db (DO NOT CHANGE: modify below)"""
    # info = {"confirm_password": "password", "first_name":
    #         "Antonio", "paypal_account": "tonym415", "password":
    #         "password", "email": "tonym415@gmail.com", "last_name":
    #         "Moses", "username": "tonym415"}

    """ modify user information for testing """
    info['username'] = "bob"
    info['password'] = "userpass"

    """ remove  from data dict """
    u_info = {i: info[i]
              for i in info if i != 'function' and '_password' not in i}
    # print(u_info)

    u = User(u_info)
    print(u.isValidUser())
