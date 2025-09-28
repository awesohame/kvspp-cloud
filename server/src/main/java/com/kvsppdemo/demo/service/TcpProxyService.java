package com.kvsppdemo.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.Closeable;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

@Service
public class TcpProxyService {
    @Value("${kvspp.tcp.host:localhost}")
    private String SERVER_HOST;

    @Value("${kvspp.tcp.port:5555}")
    private int SERVER_PORT;

    private static final String SELECT_CMD_PREFIX = "SELECT ";

    public TcpSession openSession(String storeToken) throws IOException {
        Socket socket = new Socket(SERVER_HOST, SERVER_PORT);
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        BufferedWriter out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

        // initial SELECT <storetoken> command
        String selectCmd = SELECT_CMD_PREFIX + storeToken + "\r\n";
        out.write(selectCmd);
        out.flush();

        // Read response to SELECT command
        String selectResponse = in.readLine();

        return new TcpSession(socket, in, out, selectResponse);
    }

    public boolean isForbiddenCommand(String command, String storeToken) {
        if (command == null) return false;
        String trimmed = command.trim().toLowerCase();
        String forbidden = SELECT_CMD_PREFIX.trim().toLowerCase();
        return trimmed.startsWith(forbidden);
    }

    // helper to encapsulate TCP session
    public static class TcpSession implements Closeable {
        private final Socket socket;
        private final BufferedReader in;
        private final BufferedWriter out;
        private final String selectResponse;

        public TcpSession(Socket socket, BufferedReader in, BufferedWriter out, String selectResponse) {
            this.socket = socket;
            this.in = in;
            this.out = out;
            this.selectResponse = selectResponse;
        }

        public BufferedReader getIn() { return in; }
        public BufferedWriter getOut() { return out; }
        public String getSelectResponse() { return selectResponse; }
        public Socket getSocket() { return socket; }

        @Override
        public void close() throws IOException {
            try { in.close(); } catch (Exception ignored) {}
            try { out.close(); } catch (Exception ignored) {}
            try { socket.close(); } catch (Exception ignored) {}
        }
    }
}

