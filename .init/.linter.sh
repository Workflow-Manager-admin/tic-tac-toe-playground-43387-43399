#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-playground-43387-43399/tic_tac_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

