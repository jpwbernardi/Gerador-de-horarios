#!/bin/bash
rm scheduler.db
cat db.sql | sqlite3 scheduler.db
