from hedy_base import *
from colorama import Fore, Back, Style

# Expressió regular per netejar HTML
CLEANR = re.compile('<.*?>')


def cleanhtml(raw_html):
    return re.sub(CLEANR, '', raw_html)


def print_error(*msg, tipus="Error", ident=0):
    if tipus == "Warning":
        msg = (Fore.LIGHTYELLOW_EX,) + msg + (Fore.RESET,)
    else:
        msg = (Fore.RED,) + msg + (Fore.RESET,)

    print(" " * ident, end="", file=sys.stderr)
    print(*msg, file=sys.stderr)


def print_error_line(file, line, tipus="Error", ident=0):
    print(" " * ident, end="", file=sys.stderr)
    if tipus == "Warning":
        print(Fore.LIGHTYELLOW_EX + "File:", "\"" + Fore.LIGHTBLUE_EX + file + Fore.LIGHTYELLOW_EX + "\", line",
              line + Fore.RESET,
              file=sys.stderr)
    else:
        print(Fore.RED + "File:", "\"" + Fore.LIGHTBLUE_EX + file + Fore.RED + "\", line", line + Fore.RESET,
              file=sys.stderr)

    # sense color
    # print("\tFile:", "\"" + file + "\", line", line, file=sys.stderr)


def print_error_from_response(res):
    avis = "Error inesperat"
    missatge = "Error desconegut"
    if 'Error' in res:
        avis = "Error"
        missatge = res['Error']
    elif 'Warning' in res:
        avis = "Warning"
        missatge = res['Warning']

    missatge = cleanhtml(missatge)
    linia = 0
    if 'Location' in res:
        linia = res['Location'][0]

    print_error("Informació de", avis, tipus=avis, ident=2)
    print_error_line(res['File'], str(linia), tipus=avis, ident=4)

    with open(res['File'], encoding='utf-8') as f:
        lines = f.readlines()
        print_error(lines[linia - 1].strip(), tipus=avis, ident=6)

    if 'Location' in res:
        print_error(avis, "a la", location_to_line_column(res['Location']) + ":", missatge, tipus=avis,
                    ident=2)
    else:
        print_error(avis + ":", missatge, tipus=avis, ident=2)


def get_level_from_file(file):
    import re


def get_level_from_file(file):
    match = re.search(r'\.hy(\d+)$', file)
    return int(match.group(1)) if match else 0


def console_hedy():
    import argparse
    parser = argparse.ArgumentParser(prog="hedy",
                                     description="Executa un codi HEDY amb un nivell determinat")

    parser.add_argument('-l', "--level", help="Especifica el nivell amb que vols que funcioni HEDY",
                        type=int,
                        default=0)

    parser.add_argument('-L', "--force-level", help="Força el nivell amb que vols que funcioni HEDY",
                        type=int,
                        default=0)

    parser.add_argument('-i', "--interact", help="Tipus d'interactivitat: "
                                                 "full(tortuga+musica+sleep+pausa), "
                                                 "cmd(sleep+pausa), "
                                                 "none(sense interactivitat),"
                                                 "auto(detecta per sistema)",
                        default="auto")

    parser.add_argument('-m', "--microbit", help="Codi microbit",
                        action='store_true')

    parser.add_argument('-c', "--code", help="No executis el codi, només transpila",
                        action='store_true')

    parser.add_argument('-d', "--debug", help="Activa el mode debug",
                        action='store_true')

    parser.add_argument("file", help="Fitxer amb el codi HEDY que vols executar")

    args = parser.parse_args()

    if args.microbit:
        args.code = True

    # check if the file exists
    if not os.path.exists(args.file):
        print_error("ERROR: El fitxer", args.file, "no existeix")
        return

    # Get level from file extension (.hy1, .hy2...) or flag --level
    detected_level = get_level_from_file(args.file)
    if args.level != 0 and detected_level != 0 and args.level != detected_level:
        print_error(
            "ERROR: El nivell especificat amb el flag -l no coincideix amb el nivell detectat pel fitxer. utilitza "
            "--force-level per forçar el nivell")
        return

    if args.level != 0 and args.force_level != 0 and args.level != args.force_level:
        print_error("ERROR: El nivell especificat amb el flag -l no coincideix amb el nivell forçat amb -L")
        return

    if detected_level != 0:
        args.level = detected_level

    if args.force_level != 0:
        args.level = args.force_level

    if detected_level == 0 and args.level == 0 and args.force_level == 0:
        print_error("ERROR: No s'ha pogut nivell de hedy, fes-ho manualment amb el flag --level o -l, "
                    "també pots especificar-lo a l'extensió del fitxer (.hy1, .hy2, .hy3...)")
        return

    file_abs_path = os.path.abspath(args.file)
    with open(args.file, encoding='utf-8') as f:
        hedy_code = f.read()
        try:
            res = execute_hedy(hedy_code, args.level, lang='ca', keyword_lang='en', interact=args.interact,
                               microbit=args.microbit, donot_execute=args.code, debug=args.debug)

            if 'Error' in res or 'Warning' in res:
                res['File'] = file_abs_path
                print_error_from_response(res)
        except KeyboardInterrupt:
            print_error("\nFinal: Procés interromput per l'usuari")
        except Exception as e:
            if args.debug:
                raise e
            print("Error inesperat:", str(e), file=sys.stderr)


if __name__ == '__main__':
    console_hedy()
