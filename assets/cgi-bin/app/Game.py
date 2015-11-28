#!C:\Python34\python.exe
"""
The User class is used to handle all functions related to the User
"""
import os
import sys
sys.path.append(os.path.realpath(os.path.dirname(__file__)))

from lib.Entity import Entity


class Game(Entity):

    """ for category"""
    """ initalize User object """
    _context = [__name__ == "__main__"]

    def __init__(self, *userInfo, **kwargs):
        super(Game, self).__init__()
        for dictionary in userInfo:
            for key in dictionary:
                setattr(self, "user_" + key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def sanitizeParams(self):
        return {k[5:]: v
                for k, v in self.__dict__.items()
                if k.startswith('user')}

    def removeFromQueue(self):
        """ add user params to queue"""
        query = ("UPDATE game_queue SET active = 0 WHERE queue_id = %(queue_id)s")
        params = self.sanitizeParams()
        return self.executeModifyQuery(query, params)

    def addToQueue(self):
        """ add user params to queue"""
        returnDict = {}
        query = ("INSERT INTO game_queue (user_id, question_id, wager_id, "
                 "time_id) VALUES (%(user_id)s, %(paramQuestions)s, %(wager)s, "
                 "%(timeLimit)s)")
        params = self.sanitizeParams()

        try:
            returnVal = self.executeModifyQuery(query, params)
            query = ("SELECT * FROM game_queue WHERE queue_id = %s")
            returnDict['queue'] = self.executeQuery(query, (self.cursor.lastrowid,))[0]
        except Exception as e:
            returnDict['error'] = "{}".format(e)
            returnDict['stm'] = self.cursor.statement

        return returnDict

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
                 "%(timeLimit)s and active = 1 limit 0, 3")
        return self.executeQuery(query, params, True)

    def getGameID(self):
        """ get next game_id """
        query = ("SELECT COALESCE(MAX(game_id), 1) as game_id FROM game WHERE 1")
        return self.executeQuery(query, ())[0]['game_id']

    def getGame(self):
        # game id
        g_id = None

        # return object
        returnDict = {'game_id': g_id}

        # get queued users
        users = self.getQueuedUsers()
        if len(users) >= 3:
            # set game_id
            g_id = self.getGameID()

            returnDict['game_id'] = g_id
            returnDict['users'] = []
            # move users from queue to game
            for qUser in users:
                qUser['game_id'] = g_id
                # update queue
                query = ("UPDATE game_queue SET active = 0 WHERE "
                         "queue_id = %(queue_id)s")
                # self.executeModifyQuery(query, qUser)

                # update game
                query = ("INSERT INTO game (user_id, game_id) VALUES "
                         "(%(user_id)s, %(game_id)s)")
                self.executeModifyQuery(query, qUser)

                # get user info
                query = ("SELECT username FROM users WHERE user_id = %(user_id)s ")
                user = self.executeQuery(query, qUser)[0]
                query = ("SELECT data as avatar FROM users_metadata WHERE "
                         "user_id = %(user_id)s AND meta_name = 'avatar'")
                data = self.executeQuery(query, qUser, True)
                if data:
                    user['avatar'] = data[0]['avatar']
                else:
                    user['avatar'] = ""
                returnDict['users'].append(user)

        return returnDict

    def submitThoughts(self):
        params = self.sanitizeParams()
        query = ("UPDATE game SET thoughts = %(thoughts)s WHERE "
                 "user_id = %(user_id)s and game_id = %(game_id)s")
        self.executeModifyQuery(query, params)

        # get all comments for the game
        query = ("SELECT user_id, username, thoughts FROM game INNER JOIN users "
                 "USING(user_id) WHERE game_id = %(game_id)s")
        playerResponses = self.executeQuery(query, params)

        # get user avatars
        for uinfo in playerResponses:
            query = ("SELECT data FROM users_metadata WHERE meta_name = 'avatar' and user_id = %(user_id)s")
            data = self.executeQuery(query, uinfo, True)
            if data:
                uinfo['avatar'] = data[0]['data']
            else:
                uinfo['avatar'] = ""

        return playerResponses

    def getMetaData(self):
        """ get metadata """
        returnObj = {}
        query = ("SELECT time_id, time_in_seconds FROM time_options WHERE active = 1")
        returnObj['times'] = self.executeQuery(query, ())
        query = ("SELECT credit_id, credit_value FROM credit_options WHERE active = 1")
        returnObj['wagers'] = self.executeQuery(query, ())
        return returnObj

if __name__ == "__main__":
    # info = {
    #     'id': 'gameUI',
    #     'thoughts': 'whatever',
    #     'game_id': '1',
    #     'user_id': '36'
    # }
    info = {
        'id': 'gameParameters',
        'p_paramCategory': '1',
        'paramQuestions': '8',
        'timeLimit': '2',
        'wager': '1',
        'user_id': '36',
        'function': 'GG',
        'counter': '0'
    }
    """ modify user information for testing """
    # info['stuff'] = "stuff"

    # print(Game(info).addToQueue())
    print(Game(info).getGame())
    # print(Game(info).submitThoughts())
