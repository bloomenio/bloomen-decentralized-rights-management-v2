#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

sleep 5s

exec npm start