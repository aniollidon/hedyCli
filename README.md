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
sudo apt-get install libasound2-dev -y
sudo apt-get install python3.12-tk -y

python3.12 -m venv env
source env/bin/activate
pip install -r requirements.txt  --no-cache-dir
pip install -r hedy_web/requirements.txt  --no-cache-dir
cd hedy_web/
pybabel compile -f -d translations
deactivate
cd ..

sudo cp support/hedy /usr/local/bin/hedy
sudo chmod +x /usr/local/bin/hedy

sudo chmod -R 777 /usr/share/hedyCli/hedy_web/grammars-Total/

echo "alumne ALL=(ALL) NOPASSWD: /usr/local/bin/hedy" | sudo tee /etc/sudoers.d/hedy > /dev/null

code --install-extension /usr/share/hedyCli/vscode-ext/hedy-highlighting/hedy-0.0.4.vsix

```
