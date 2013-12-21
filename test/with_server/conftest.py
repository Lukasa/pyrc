# -*- coding: utf-8 -*-

"""
The tornado.testing Async stuff adjusted for websocket use then packaged as
fixtures for use with py.test. Stolen almost entirely from
https://gist.github.com/robcowie/7843633
"""

import pytest
import socket
import sys
import functools

from tornado import netutil
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.iostream import IOStream
from tornado.websocket import websocket_connect
from tornado.util import raise_exc_info

from repeater import application


class AsyncClient(object):
    ## A port of parts of AsyncTestCase. See tornado.testing.py:275

    def __init__(self, httpserver, sock):
        self.__stopped = False
        self.__running = False
        self.__stop_args = None
        self.__failure = None
        self.tcpconn = None
        self.httpserver = httpserver


        # We want to be able to grab an inbound TCP connection as and when we
        # get it.
        cb = functools.partial(self.inbound_tcp_conn, sock)
        self.io_loop.add_handler(
            sock.fileno(),
            cb,
            self.io_loop.READ | self.io_loop.WRITE
        )

    def ws_connect(self):
        ## This seems a bit fragile. How else to get the dynamic port number?
        port = list(self.httpserver._sockets.values())[0].getsockname()[1]
        url = u'ws://localhost:%s/wsock/' % port
        websocket_connect(url, self.io_loop, self.stop)
        return self.wait()

    def inbound_tcp_conn(self, sock, fd, *args):
        connection, address = sock.accept()
        connection.setblocking(0)
        self.tcpconn = IOStream(connection)
        self.io_loop.remove_handler(fd)
        self.stop(self.tcpconn)

    def establish_connections(self):
        # Get the websocket and the TCP connection.
        tcp_conn = self.ws_connect()
        ws_conn = self.wait()
        ws_conn = ws_conn.result()
        return (ws_conn, tcp_conn)

    @property
    def io_loop(self):
        ## We're using a singleton ioloop throughout
        return IOLoop.instance()

    def stop(self, _arg=None, **kwargs):
        """Stops the `.IOLoop`, causing one pending (or future) call to `wait()`
        to return.
        """
        assert _arg is None or not kwargs
        self.__stop_args = kwargs or _arg
        if self.__running:
            self.io_loop.stop()
            self.__running = False
        self.__stopped = True

    def __rethrow(self):
        if self.__failure is not None:
            failure = self.__failure
            self.__failure = None
            raise_exc_info(failure)

    def wait(self, condition=None, timeout=None):
        if timeout is None:
            timeout = 5

        if not self.__stopped:
            if timeout:
                def timeout_func():
                    try:
                        raise self.failureException(
                            'Async operation timed out after %s seconds' %
                            timeout)
                    except Exception:
                        self.__failure = sys.exc_info()
                    self.stop()
                self.__timeout = self.io_loop.add_timeout(self.io_loop.time() + timeout, timeout_func)
            while True:
                self.__running = True
                self.io_loop.start()
                if (self.__failure is not None or
                        condition is None or condition()):
                    break
            if self.__timeout is not None:
                self.io_loop.remove_timeout(self.__timeout)
                self.__timeout = None
        assert self.__stopped
        self.__stopped = False
        self.__rethrow()
        result = self.__stop_args
        self.__stop_args = None
        return result


def bind_unused_port():
    """Binds a server socket to an available port on localhost.
    Returns a tuple (socket, port).
    """
    [sock] = netutil.bind_sockets(None, 'localhost', family=socket.AF_INET)
    port = sock.getsockname()[1]
    return sock, port


@pytest.fixture(scope='session')
def app(request):
    return application


@pytest.fixture(scope='session')
def http_server(request, app):
    ## Build server as in testing:311
    sock, port = bind_unused_port()
    server = HTTPServer(application, io_loop=IOLoop.instance())
    server.add_sockets([sock])
    return server


@pytest.fixture(scope='session')
def socket_pool(request, app, http_server):
    # Initialise a listening TCP socket.
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setblocking(0)
    sock.bind(("", 6667))
    sock.listen(128)
    return sock


@pytest.fixture(scope='function')
def client(request, app, http_server, socket_pool):
    return AsyncClient(http_server, socket_pool)
