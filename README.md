# BillInsight


## Commands

- build

    ```bash
    npm run tauri android build
    ```
### Run on linux

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

### Run on Window

- run dev desktop

    ```bash
    for /f "tokens=5" %a in ('netstat -ano ^| findstr :4200') do taskkill /PID %a /F
    npm run tauri dev
    ```

### Clean

```bash
cd src-tauri
cargo clean
```