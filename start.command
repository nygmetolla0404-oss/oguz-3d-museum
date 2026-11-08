#!/bin/bash
# Сайтты жергілікті серверде ашу (қолмен басқару мен интернет-фотолар үшін ұсынылады)
cd "$(dirname "$0")"
PORT=8080
( sleep 1; open "http://localhost:$PORT/index.html" ) &
echo "Сайт ашылуда: http://localhost:$PORT  (тоқтату үшін осы терезені жабыңыз)"
python3 -m http.server $PORT
