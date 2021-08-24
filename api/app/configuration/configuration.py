# import os
from dotenv import load_dotenv


class Configuration:

    def __init__(self, file_path=None):
        load_dotenv()
