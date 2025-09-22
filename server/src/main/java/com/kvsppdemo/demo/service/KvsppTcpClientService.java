package com.kvsppdemo.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.*;
import java.net.Socket;

@Service
public class KvsppTcpClientService {
    @Value("${kvspp.tcp.host:localhost}")
    private String host;

    @Value("${kvspp.tcp.port:5555}")
    private int port;

    public synchronized String sendCommand(String storeToken, String command) throws IOException {
        try (Socket socket = new Socket(host, port);
             BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
             BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            // Send SELECT <storetoken> first
            writer.write("SELECT " + storeToken + "\n");
            writer.flush();
            String selectResponse = reader.readLine();
            if (selectResponse == null || selectResponse.startsWith("ERROR")) {
                throw new IOException("Failed to select store: " + selectResponse);
            }

            // Send the actual command
            writer.write(command + "\n");
            writer.flush();
            String response = reader.readLine();
            return response;
        }
    }
}

