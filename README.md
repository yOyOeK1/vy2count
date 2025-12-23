# vy2count

Two split bash tasks over multiple Agents a.k.a. Clustering. Bash tasks over multiple computers to `count` / process data.

## Agent

To start it as websocket gate to receive and send information's to Agent.

```bash
node ./agent.js "local"
```

##### commands @ws

- ? | h

- @R

- @W

- +W:name

- E:cmd

##### configuring

All need to be done over file `Aconfig.js` It have list of Agents to work with. It's self explanatory json file.
Agents need to be with `ssh` access and they should have exchange with Master id_rsa....pub key to log in with out password.
Main communication is done over dedicated WS channel. Ssh access is only to send data or execute extra command.

## Master

Using websocat as wscat aliased in this case. To send some data / message's to Agent.

```bash
wscat ws://localhost:8090
```




### changlog
251223 - it's hard first commit


---

### notes

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
