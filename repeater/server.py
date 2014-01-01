# -*- coding: utf-8 -*-
"""
repeater/server.py
~~~~~~~~~~~~~~~~~~

The main HTTP server that powers pyrc. Right now, in this basic form, all it
does is provide access to the websocket repeater.
"""
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.options import parse_command_line, define, options

from .repeater import Repeater
import os.path


INDEX_LOC = os.path.join(os.path.dirname(__file__), "templates", "index.html")


class HomeHandler(RequestHandler):
    """
    Render the home page. For now there's no intelligent logic here, but there
    might be at a later date.
    """
    index = ''

    def get(self):
        if not self.index:
            with open(INDEX_LOC, 'r') as f:
                self.index = f.read()

        self.write(self.index)


# Define the top-level Tornado application.
application = Application(
    [
        (r"/wsock/?$", Repeater),
        (r"/$", HomeHandler),
    ],
    gzip=True,
    static_path=os.path.join(os.path.dirname(__file__), "..", "static"),
    template_path=os.path.join(os.path.dirname(__file__), "templates"),
)


if __name__ == '__main__':
    # Parse the command line.
    define("port", default=80, type=int, help="The port that Pyrc will listen on")
    parse_command_line()

    application.listen(options.port)
    IOLoop.instance().start()
