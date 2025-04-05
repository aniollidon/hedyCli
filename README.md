# Extensió VSCODE
Instal·la l'[extensió](https://marketplace.visualstudio.com/items?itemName=aniollidon.hedy-highlighting)

# Passos d'instal·lació HedyCli a linux (ordinadors alumnes)
```
# Clonar repo i posar codi a lloc
git clone https://github.com/aniollidon/hedyCli.git
cd hedyCli
git submodule init
git submodule update

# Moure-ho a sistema
cd ..
sudo mv hedyCli/ /usr/share/hedyCli
cd /usr/share/hedyCli

# Requeriments de sistema
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt install python3.12 -y
sudo apt install python3.12-venv -y
sudo apt-get install python3.12-dev -y
sudo apt-get install libasound2-dev -y
sudo apt-get install python3.12-tk -y

# Requeriments de python
python3.12 -m venv env
source env/bin/activate
pip install -r requirements.txt  --no-cache-dir
pip install -r hedy_web/requirements.txt  --no-cache-dir
cd hedy_web/
pybabel compile -f -d translations
deactivate
cd ..

# Copiem script per a que funcioni com a comanda
sudo cp support/hedy /usr/local/bin/hedy
sudo chmod +x /usr/local/bin/hedy

# Marranades de funcionament
sudo chmod -R 777 /usr/share/hedyCli/hedy_web/grammars-Total/
echo "alumne ALL=(ALL) NOPASSWD: /usr/local/bin/hedy" | sudo tee /etc/sudoers.d/hedy > /dev/null

# instal·lar l'extensió a VSCODE
code --install-extension aniollidon.hedy-highlighting
```
