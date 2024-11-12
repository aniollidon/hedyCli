from hedy_base import *


def print_error(res):
    avis = "Error inesperat"
    missatge = "Error desconegut"
    if 'Error' in res:
        avis = "Error"
        missatge = res['Error']
    elif 'Warning' in res:
        avis = "Warning"
        missatge = res['Warning']

    if 'Location' in res:
        print(avis, "a la", location_to_line_column(res['Location']) + ":", missatge, file=sys.stderr)
    else:
        print(avis + ":", missatge, file=sys.stderr)


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
        print("ERROR: El fitxer", args.file, "no existeix", file=sys.stderr)
        return

    # Get level from file extension (.hy1, .hy2...) or flag --level
    detected_level = get_level_from_file(args.file)
    if args.level != 0 and detected_level != 0 and args.level != detected_level:
        print("ERROR: El nivell especificat amb el flag -l no coincideix amb el nivell detectat pel fitxer",
              file=sys.stderr)
        return

    if detected_level != 0:
        args.level = detected_level

    if detected_level == 0 and args.level == 0:
        print("ERROR: No s'ha pogut nivell de hedy, fes-ho manualment amb el flag --level o -l, també pots "
              "especificar-lo a l'extensió del fitxer (.hy1, .hy2, .hy3...)", file=sys.stderr)
        return

    with open(args.file, encoding='utf-8') as f:
        hedy_code = f.read()
        try:
            res = execute_hedy(hedy_code, args.level, interact=args.interact, microbit=args.microbit,
                               donot_execute=args.code, debug=args.debug)

            if 'Error' in res or 'Warning' in res:
                print_error(res)
        except KeyboardInterrupt:
            print("\nFinal: Procés interromput per l'usuari", file=sys.stderr)
        except Exception as e:
            if args.debug:
                raise e
            print("Error inesperat:", str(e), file=sys.stderr)


if __name__ == '__main__':
    console_hedy()
