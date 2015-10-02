#!C:\Python34\python.exe -m
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
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
                setattr(self, key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def getAllUsers(self):
        """ get user information by name """
        query = """SELECT `USER_ID`, `NAME`, `EMAIL`, `USERNAME`,
            `PASSWORD`, `CREDIT`, `WINS`, `LOSSES`, `PAYPAL_ACCOUNT`,
            `Created`, `Active` FROM `users` WHERE 1
            """
        cursor = self._cnx.cursor(buffered=True)
        cursor.execute(query)
        if cursor.rowcount > 0:
            rows = cursor.fetchall()
            for row in rows:
                print(row)
        else:
            print("No user by the name '%s'" % self.username)

    def getUser(self):
        """ get user information by name """
        # query = """SELECT `USER_ID`, `NAME`, `EMAIL`, `USERNAME`,
        #     `PASSWORD`, `CREDIT`, `WINS`, `LOSSES`, `PAYPAL_ACCOUNT`,
        #     `Created`, `Active` FROM `users` WHERE 1
        #     """
        query = """SELECT  USER_ID ,  NAME ,  EMAIL ,  USERNAME ,
             PASSWORD ,  CREDIT ,  WINS ,  LOSSES ,  PAYPAL_ACCOUNT ,
             Created ,  Active  FROM  users  WHERE USERNAME = %s"""
        cursor = self._cnx.cursor(buffered=True)
        cursor.execute(query, (self.username,))
        if cursor.rowcount > 0:
            rows = cursor.fetchall()
            for row in rows:
                print(row)
        else:
            print("No user by the name '%s'" % self.username)

    def isUser(self):
        """ checking for username availability """
        query = """SELECT  USERNAME  FROM  users  WHERE USERNAME = %s"""
        cursor = self._cnx.cursor(buffered=True)
        cursor.execute(query, (self.username,))
        """ if number of rows fields is bigger them 0 that means it's NOT
         available returning 0, 1 otherwise
         """
        if self._context: # if running as a standalone script
            print("(%s : retured %d rows)\n" %
                  (cursor.statement, cursor.rowcount))

        return (0, 1)[cursor.rowcount > 0]

if __name__ == "__main__":
    """ valid user in db (DO NOT CHANGE: modify below)"""
    info = {'username': 'test_user1', 'confirm_password': 'password', 'name':
            'Test UserOne', 'function': 'SUI', 'email': 'test_user@domain.com',
            'paypal_account': 'paypal_user1', 'password': 'password'}

    """ modify user information for testing """
    # info['username'] = "blaw"

    """ remove  from data dict """
    u_info = {i: info[i]
              for i in info if i != 'function' and '_password' not in i}
    # print(u_info)

    u = User(u_info)
    u.getUser()
    print("%s isUSER: %s" % (u.username, u.isUser()))
