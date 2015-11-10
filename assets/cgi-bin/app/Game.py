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
        query = ("SELECT * FROM game_queue WHERE queue_id = %s")
        return self.executeQuery(query, (self.cursor.lastrowid,))

    def getPlayerQueue(self):
        """ get all user in queue ready for game """
        query = ("SELECT queue_id, user_id, game_queue.question_id, "
                 "game_queue.wager_id, game_queue.time_id, active FROM "
                 "game_queue JOIN  (SELECT question_id, wager_id, time_id FROM "
                 "game_queue WHERE active = 1 GROUP BY question_id, wager_id, "
                 "time_id HAVING count(*) >= 3) AS sub ON "
                 "(game_queue.question_id=sub.question_id) AND "
                 "(game_queue.wager_id=sub.wager_id) "
                 "AND(game_queue.time_id=sub.time_id)")
        return self.executeQuery(query, (), True)

    def getQueuedUsers(self):
        """ get available user in queue """
        params = self.sanitizeParams()
        query = ("SELECT queue_id, user_id FROM game_queue WHERE question_id = "
                 "%(paramQuestions)s and wager_id = %(wager)s and time_id = "
                 "%(timeLimit)s limit 0, 3")
        return self.executeQuery(query, params, True)

    def getGameID(self):
        """ get next game_id """
        query = ("SELECT COALESCE(MAX(game_id), 1) as game_id FROM game WHERE 1")
        return self.executeQuery(query, ())[0]['game_id']

    def getGame(self):
        # set game_id
        g_id = self.getGameID()

        # get queued users
        users = self.getQueuedUsers()

        # move users from queue to game
        for qUser in users:
            qUser['game_id'] = g_id
            # update queue
            query = ("UPDATE game_queue SET active = 0 WHERE "
                     "queue_id = %(queue_id)s")
            self.executeModifyQuery(query, qUser)

            # update game
            query = ("INSERT INTO game (user_id, game_id) VALUES "
                     "(%(user_id)s, %(game_id)s)")
            self.executeModifyQuery(query, qUser)

        return {'game_id': g_id}

    def getMetaData(self):
        """ get metadata """
        returnObj = {}
        query = ("SELECT time_id, time_in_seconds FROM time_options WHERE active = 1")
        returnObj['times'] = self.executeQuery(query, ())
        query = ("SELECT credit_id, credit_value FROM credit_options WHERE active = 1")
        returnObj['wagers'] = self.executeQuery(query, ())
        return returnObj

    def executeModifyQuery(self, query, params):
        returnDict = {}
        try:
            self.cursor.execute(query, params)
            self._cnx.commit()
        except Exception as e:
            returnDict['error'] = "{}".format(e)
            returnDict['stm'] = self.cursor.statement

        return returnDict

    def executeQuery(self, query, params, returnEmpty=False):
        returnDict = {}
        try:
            self.cursor.execute(query, params)
            if self.cursor.rowcount > 0:
                returnDict = self.cursor.fetchall()
            elif returnEmpty:
                returnDict = {}
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
        'id': 'gameParameters',
        'p_paramCategory': '1',
        'paramQuestions': '8',
        'timeLimit': '1',
        'wager': '1',
        'user_id': '52',
        'function': 'GG',
        'counter': '2'
    }
    """ modify user information for testing """
    # info['stuff'] = "stuff"

    # print(Game(info).addToQueue())
    print(Game(info).getQueuedUsers())
