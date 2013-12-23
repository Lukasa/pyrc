# -*- coding: utf-8 -*-
"""
repeater/repeater.py
~~~~~~~~~~~~~~~~~~~~

This class defines the underlying TCP<->websocket repeater that powers the
pyrc server. This maps a websocket connection directly to a single TCP
connection. Data is repeated from one end to the other in a beautiful display
of asynchronous joy.
"""
import socket
from tornado.websocket import WebSocketHandler
from tornado.iostream import IOStream


class Repeater(WebSocketHandler):
    """
    The underlying TCP<->websocket repeater that powers the pyrc server. Right
    now this class has a few hard-coded limitations: it only connects to one
    server location, on one port, without SSL. All of these limitations will
    be removed at one time or another.
    """

    def __init__(self, *args, **kwargs):
        super(Repeater, self).__init__(*args, **kwargs)

        self.tcp = None
        self.target_host = '127.0.0.1'
        self.target_port = 6667
        self.half_closed = False

    def open(self, *args, **kwargs):
        """
        When a websocket connection is opened, we open a TCP connection to the
        remote server. Wait to start hearing traffic from it.
        """
        server = self.get_argument('server', None)
        if server is not None:
            self.target_host = server

        sck = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.tcp = IOStream(sck)
        self.tcp.set_close_callback(self.async_callback(self.on_irc_close))
        self.tcp.connect((self.target_host, self.target_port))
        self.tcp.read_until(b"\n", self.async_callback(self.on_irc_message))

    def on_message(self, message):
        """
        Called whenever a websocket message is received. Echoes the message,
        without adjustment, on the TCP connection.
        """
        self.tcp.write(message.encode('utf-8'))

    def on_irc_message(self, data):
        """
        Called whenever a message is received on the TCP connection. Echoes the
        message, without qualification, on the websocket connection.
        """
        self.write_message(data)
        self.tcp.read_until(b"\n", self.async_callback(self.on_irc_message))

    def on_close(self):
        """
        When a websocket connection is closed, we close the TCP connection as
        well.
        """
        if not self.half_closed:
            self.half_closed = True
            self.tcp.close()

    def on_irc_close(self):
        """
        When a TCP connection is closed, we close the websocket connection as
        well.
        """
        if not self.half_closed:
            self.half_closed = True
            self.close()
