#!C:\Python34\python.exe -m
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

import lib.db2

class User(object):

    """docstring for User"""
    """ initalize User object """
    _cnx = None

    def __init__(self, *userInfo, **kwargs):
        self._cnx = lib.db2.get_connection()
        for dictionary in userInfo:
            for key in dictionary:
                setattr(self, key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def getUser(self):
        """ get user information by name """
        # query = """SELECT `USER_ID`, `NAME`, `EMAIL`, `USERNAME`,
        #     `PASSWORD`, `CREDIT`, `WINS`, `LOSSES`, `PAYPAL_ACCOUNT`,
        #     `Created`, `Active` FROM `users` WHERE 1
        #     """
        query = """SELECT  USER_ID ,  NAME ,  EMAIL ,  USERNAME ,
             PASSWORD ,  CREDIT ,  WINS ,  LOSSES ,  PAYPAL_ACCOUNT ,
             Created ,  Active  FROM  users  WHERE USERNAME = %s"""
        cursor = self._cnx.cursor()
        cursor.execute(query, (self.username,))
        rows = cursor.fetchall()
        for row in rows:
            print(row)


if __name__ == "__main__":
    """ remove  from data dict """
    info = {'username': 'test_user1', 'confirm_password': 'password', 'name':
            'Test UserOne', 'function': 'SUI', 'email': 'test_user@domain.com',
            'paypal_account': 'paypal_user1', 'password': 'password'}

    u_info = {i: info[i]
              for i in info if i != 'function' and '_password' not in i}
    u = User(u_info)
    u.getUser()
