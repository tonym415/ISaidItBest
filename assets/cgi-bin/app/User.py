#!C:\Python34\python.exe -u
"""
The User class is used to handle all functions related to the User
"""


class User(object):
    """docstring for User"""
    """ initalize User object """
    def __init__(self, *userInfo, **kwargs):
        for dictionary in userInfo:
            for key in dictionary:
                setattr(self, key, dictionary[key])

        for key in kwargs:
            setattr(self, key, kwargs[key])

if __name__ == "__main__":
    """ remove  from data dict """
    info = {'email': 'tonym415@gmail.com', 'function': 'SUI', 'name':
        'vhn', 'paypal_account': 'asdfdf', 'password': 'password', 'username': 
        'user', 'confirm_password': 'password'}
    u_info = {i:info[i] for i in info if i !='function' and '_password' not in i}
    u = User(u_info)
    print(dir(u))
