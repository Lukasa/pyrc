# -*- coding: utf-8 -*-
"""
test/test_server.py
~~~~~~~~~~~~~~~~~~~

Tests the pyrc server by actually spinning up an actual server, and actually
sending actual socket messages to it. This is integration testing, not unit
testing, but it's suitably useful that it's the default testing mode.
"""
class TestServer(object):
    """
    Test the pyrc server.
    """
    def test_echo_ws_to_tcp(self, client):
        data = "Hi there sir.\r\n"

        # Perform the handshake.
        ws_conn, tcp_conn = client.establish_connections()

        # Send a message through the websocket.
        ws_conn.write_message(data)

        # Read it on the TCP socket.
        tcp_conn.read_until(b"\r\n", client.stop)
        received = client.wait()

        assert received.decode("utf-8") == data

    def test_echo_tcp_to_ws(self, client):
        data = "Hi there sir\r\n"

        # Perform the handshake.
        ws_conn, tcp_conn = client.establish_connections()

        # Send a message through the TCP connection.
        tcp_conn.write(data.encode("utf-8"))

        # Read it on the websocket.
        ws_conn.read_message(client.stop)
        received = client.wait().result()

        assert received == data
