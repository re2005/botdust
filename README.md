# BotDust
Chat bot for BitDust engine

https://bitdust.io/

How to run it:


First build docker image:

```
$ docker build -t botdust:0.0.1 .
```

Once you have the image done, you can run it:
```
docker run -d --network="host" botdust:0.0.1
```

Make sure you have BitDust also running on localhost

To stop the container
```
$ docker ps

* copy the ID

$docker stop {id}
```
