#!C:\Python34\python.exe
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

    def updateCategory(self):
        """ update category with parameters """
        # get current record for category to compare
        query = "SELECT "

        params = self.sanitizeParams()
        # query = "UPDATE question_categories SET parent_id = %(parent_id)s WHERE"
        #     "category_id = %(c);"
        return {"success": params}

    def newCategory(self):
        """ insert new category with/without parent_id """
        query = ("INSERT INTO question_categories (category, parent_id)"
                 " VALUES (%(c_Category)s, %(parent_id)s)")
        params = self.sanitizeParams()
        # specific sanitation of data
        if 'c_Category' in params.keys():
            cat = params['c_Category']
            if not cat or cat == "":
                return {'error': "missing new category name"}
            else:
                if 'parent_id' not in params.keys():
                    params['parent_id'] = None
                returnVal = self.executeInsertQuery(query, params)
                return {'success': self.cursor.lastrowid} if 'error' not in returnVal else {'error': returnVal}

    def getAllCategories(self):
        """ get user information by name """
        query = """SELECT category_id, category, parent_id
                FROM  question_categories WHERE active = 1
            """
        return self.executeQuery(query, ())

    def executeInsertQuery(self, query, params):
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
    info = {'form_id': 'renameCategory', 'r_currentCategory': 17,
            'r_newCategory': 'TV', 'function': 'UC'}

    """ modify user information for testing """
    # info['stuff'] = "stuff"

    print(Category(info).updateCategory())
