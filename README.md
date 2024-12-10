```
git clone https://github.com/aniollidon/hedyCli.git
cd hedyCli
git submodule init
git submodule update

cd ..

sudo mv hedyCli/ /usr/share/hedyCli
cd /usr/share/hedyCli

sudo add-apt-repository ppa:deadsnakes/ppa -y

sudo apt install python3.12 -y
sudo apt install python3.12-venv -y
sudo apt-get install python3.12-dev -y
python3.12 -m venv env
source env/bin/activate
pip install -r hedy_web/requirements.txt  --no-cache-dir
deactivate

sudo cp support/hedy /usr/local/bin/hedy
sudo chmod +x /usr/local/bin/hedy

 sudo chmod -R 777 /usr/share/hedyCli/hedy_web/grammars-Total/

code --install-extension /usr/share/hedyCli/vscode-ext/hedy-highlighting/hedy-0.0.3.vsix

```
