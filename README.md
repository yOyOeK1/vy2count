



## Agent
To start it as websocket gate to receve and send informations back.
```bash
node ./agent.js "local"
```

#### commands at agent @ws
? | h
E:cmd
@R



## Master
Using websocat as wscat aliased in this case. To send some data / msg's to Agent.
```bash
wscat ws://localhost:8090
```











### dependencys

- `websocat` https://github.com/vi/websocat/releases



### nice scripts

 * to get Aconfig by name
 ```bash
cat ../Aconfig.json | jq '.[] | select(.name == "yoyDel")'
```


 * to start terminal.sh for agent with config
 ```bash
./terminal.sh "`cat ../Aconfig.json | jq '.[] | select(.name == "yoyDel")'`"
```

 * start it
```bash
websocat -s 8081 sh-c:"exec bash -c ./s.sh"
```
