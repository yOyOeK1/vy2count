# vy2count

Two split bash tasks over multiple Agents a.k.a. Clustering. Bash tasks over multiple computers to `count` / process data.

## Dependency

* bash / linux shell access
* nodejs, ws

## Agent

To start it as websocket gate to receive / send information's / data / tasks to Agent and back.

```bash
node ./agent.js "local"
```

where `local` is one of example agents define in config file.

##### Configuring

All need to be done over file `Aconfig.js` It have list of Agents to work with. It's self explanatory json file.
Agents need to be with `ssh` access and they should have exchange with Master `id_rsa....pub` key to log in with out password.
Main communication is done over dedicated WS channel. Ssh access is only to send data or execute extra command.

##### Commands @ws

- ? | h

- @R - force agent raport to Master

- @W - spit out all list of workspacesy and ther current status

- +W:name - create new work named `name`

- E:cmd - execute command at Agent

## Master

Using websocat as wscat aliased in this case. To send some data / message's to Agent.

```bash
wscat ws://localhost:8090
```

after establishing connection you cent prompt Agent with commands ...

##### Example commands

From master or any where you connect to Agent. So in bash you can:

- get instant agent **reports** about work space status and others info ...
  
  ```bash
  a=`echo "@W" |./bin/wscat ws://localhost:8190 | grep "#R"`; echo $a | cut -d '#' -f 3 | jq -r .msg | jq .
  ```
  
  **will return** 
  
  ```json
  {
  "dirName": "678",
  "dirname": "/tmp/vy2",
  "fsList": [
    "a.png",
    ....
    "vi2.mp4"
  ]
  }
  ...
  {
  "dirName": "task1",
  "dirname": "/tmp/vy2",
  "fsList": []
  }
  ```

- **push data / file** to agent to work space
  
  ```bash
  echo "+B:678:r3.md:`base64 -w 0 ./testAssets/README.md`" | ./bin/wscat ws://localhost:8190
  ```
  
  `678` - working directory
  `r3.md` - target name
  
  **OR**
  
  ```bash
  echo "+B:678:vi2.mp4:`base64 -w 0 ~/Videos/WIRE\ ROPE\ HAND\ EYE\ SPLICE-    iDnhv1ObVhY.mp4`" | ./bin/wscat ws://localhost:8190
  ```

## changlog

251223 - it's hard first commit

---

#### notes

- `websocat` https://github.com/vi/websocat/releases

##### nice scripts ( depricated )

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

---

If you see that this makes sense [ send me a ☕ ](https://ko-fi.com/B0B0DFYGS) | [Master repository](https://github.com/yOyOeK1/oiyshTerminal) | [About SvOiysh](https://www.youtube.com/@svoiysh)  
