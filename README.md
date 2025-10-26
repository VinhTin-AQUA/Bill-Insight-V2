# BillInsight


## Commands

- build

    ```bash
    npm run tauri android build
    ```

- run dev window

    ```bash
    sudo kill -9 $(sudo lsof -t -i:4200) \
    npx tauri dev # npm run tauri dev
    ```

- run dev desktop

    ```bash
    sudo kill -9 $(sudo lsof -t -i:4200)
    npm run tauri dev
    ```

- run dev android

    ```bash
    sudo kill -9 $(sudo lsof -t -i:4200)
    ng serve --host 0.0.0.0 --port 4200 & npm run tauri android dev
    ```