from setuptools import setup, find_packages
import os

with open('hedy_web/requirements.txt') as f:
    requirements = f.read().splitlines()

# problema amb la versio d'awscli


def copy_dir():
    copyfrompath = 'hedy_web'
    base_dir = os.path.join(os.path.dirname(__file__), copyfrompath)
    for (dirpath, dirnames, files) in os.walk(base_dir):
        if base_dir in dirpath:
            relativepath = dirpath[len(base_dir):]
        else:
            relativepath = dirpath
        relativepath = os.path.join(copyfrompath, relativepath)


        if relativepath.startswith('.'):
            relativepath = relativepath[1:]
        if relativepath.startswith('/'):
            relativepath = relativepath[1:]
        if relativepath.startswith('\\'):
            relativepath = relativepath[1:]

        # Filtra directoris que comencin per _
        if relativepath.startswith('_') or relativepath.startswith('.'):
            continue

        # Filter directories
        for exclude_dir in ['static', 'docs', 'content', 'website', 'tests', 'build-tools']:
            if exclude_dir in dirpath:
                continue

        for f in files:
            # Filtra els fitxers que no siguin .py, .po o .json
            if not (f.endswith('.py') or f.endswith('.po') or f.endswith('.json')):
                continue
            print(os.path.join(dirpath, f))
            yield os.path.join(relativepath, f)

setup(
    name='Hedy',
    version='0.1',
    description='Llenguatge hedy en local',
    url='https://github.com/hedyorg/hedy',
    author='Aniol Lidon',
    author_email='alidon1@inspalamos.cat',
    license='MIT',
    install_requires=requirements,
    packages=find_packages(),
    py_modules=["hedy_cli", "hedy_base"],
    package_dir={"hedy_web": "hedy_web", "hedy_web/website":"hedy_web/website"},
    package_data={
        "": ["*.json"],
        "grammars": ["*.lark"]
    },
    entry_points=dict(
        console_scripts=['hedy=hedy_cli:console_hedy']
    )
)