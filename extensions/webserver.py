from bottle import Bottle, run, request, response, static_file
import os
import inspect
app = Bottle()


def redirigeix(url):
    url = str(url)
    # Return javascript redirect
    return "<script>window.location.href = '" + url + "';</script>"


def vincula_fitxer(ruta, fitxer):
    global app
    ruta = str(ruta)
    fitxer = str(fitxer)
    filepath = os.path.abspath(os.path.join('..', fitxer))

    print("Ruta:", ruta, " -> ", fitxer)

    # read file
    with open(filepath, 'r') as file:
        data = file.read()

    app.route(ruta, method='GET', callback=lambda: data)


def vincula_funcio(ruta, func):
    ruta = str(ruta)
    print("Ruta:", ruta, " -> ", str(func))
    sig = inspect.signature(func)
    arguments = sig.parameters
    print("      amb paràmetres:", [param for param in arguments])

    global app

    def enmascara_crida_hedy():
        map = {}
        for param in arguments:
            map[param] = Value(request.query.get(param))

        missatge = str(func(**map))
        return missatge

    app.route(ruta, method='GET', callback=enmascara_crida_hedy)


def init_servidor():
    print("Iniciant servidor web...")
    run(app, host='localhost', port=8080)
