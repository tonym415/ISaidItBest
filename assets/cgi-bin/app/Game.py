#!C:\Python34\python.exe
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

import lib.db2


class Game(object):

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

    def addToQueue(self):
        """ add user params to queue"""
        query = ("INSERT INTO game_queue (user_id, question_id, wager_id, "
                 "time_id) VALUES (%(user_id)s, %(paramQuestions)s, %(wager)s, "
                 "%(timeLimit)s)")
        params = self.sanitizeParams()
        returnVal = self.executeModifyQuery(query, params)
        return {'success': self.cursor.lastrowid} if 'error' not in returnVal else {'error': returnVal}

    def getGame(self):
        """ get user information by name """
        query = ("SELECT queue_id, user_id, active FROM game_queue LEFT JOIN (SELECT question_id, wager_id, time_id FROM game_queue "
                 " GROUP BY question_id, wager_id, time_id HAVING count(*) > 3) "
                 "AS sub ON (game_queue.question_id=sub.question_id) AND (game_queue.wager_id=sub.wager_id) "
                 " AND (game_queue.time_id=sub.time_id) WHERE active = 1")
        return query
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
        "id": "gameParameters",
        "p_paramCategory": "1",
        "p_paramCategoryChk": "on",
        "p_subCategory[]": "38",
        "paramQuestions": "6",
        "timeLimit": "2",
        "wager": "1",
        "user_id": 52,
        "function": "SGP"
    }
    """ modify user information for testing """
    # info['stuff'] = "stuff"

    # print(Game(info).addToQueue())
    print(Game(info).getGame())
