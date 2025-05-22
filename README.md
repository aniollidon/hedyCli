# HedyCLI
Running Hedy locally on your computer. 

## About Hedy

[Hedy](https://www.hedy.org/) is a gradual programming language aimed at teaching programming and teaching Python. It
teaches using different levels. The first level just offers printing text and asking for input. This level is meant to
introduce learners to the idea of a programming language, and the environment. From there, Hedy builds up to include
more complex syntax and additional concepts.

Hedy is maintained by the Hedy Foundation (Stichting Hedy).

This extension is maintained by aniollidon who is not related with Hedy team, apart from a great admiration for the work
they have done.

# This project
This project contains:
+ A python application which wrappers Hedy website and provides a command line interface to work locally.
+ A [VSCODE language extension](https://marketplace.visualstudio.com/items?itemName=aniollidon.hedy-highlighting) supporting Hedy code and error highlighting.


### Highlighting Extension
Install the [extension](https://marketplace.visualstudio.com/items?itemName=aniollidon.hedy-highlighting).

### Hedy CLI interface
The application is currently not packaged. So you should run python directly.

#### Installation script (it could be much better, sorry)

###### For Ubuntu/ Debian 
Downloading code at `/usr/share` and coping command script at `/usr/local/bin`

```bash
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
sudo apt install python3.12-dev -y
sudo apt install libasound2-dev -y
sudo apt install python3.12-tk -y

# Requeriments del projecte python
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

# Marranades de funcionament (not proud of it)
sudo chmod -R 777 /usr/share/hedyCli/hedy_web/grammars-Total/

# Unncoment for turle (descomenta per la tortuga)
# echo "alumne ALL=(ALL) NOPASSWD: /usr/local/bin/hedy" | sudo tee /etc/sudoers.d/hedy > /dev/null

# instal·lar l'extensió a VSCODE
code --install-extension aniollidon.hedy-highlighting
```
