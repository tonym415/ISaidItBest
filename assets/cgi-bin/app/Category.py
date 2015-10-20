#!C:\Python34\python.exe -m
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

import lib.db2


class Category(object):

    """ for category"""
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

    def newCategory(self):
        """ insert new category with/without parent_id """
        query = """INSERT INTO question_categories (category, parent_id) VALUES
                (%(c_Category)s, %(parent_id))"""
        self.executeQuery(query)
        return self.getAllCategories()

    def getAllCategories(self):
        """ get user information by name """
        query = """SELECT category_id, category, parent_id
                FROM  question_categories
            """
        return self.executeQuery(query)

    def executeQuery(self, query, useDict=True):
        returnDict = {}
        cursor = self._cnx.cursor(buffered=True, dictionary=useDict)
        try:
            cursor.execute(query)
            if cursor.rowcount > 0:
                returnDict = cursor.fetchall()
            else:
                raise Exception("%s yields %s" %
                                (cursor.statement.replace('\n', ' ')
                                 .replace('            ', ''), cursor.rowcount))
        except Exception as e:
            returnDict['error'] = "{}".format(e)

        return returnDict

if __name__ == "__main__":
    info = {}

    """ modify user information for testing """
    info['username'] = "bob"
    info['password'] = "userpass"

    c = Category()
    print(c.getAllCategories())
