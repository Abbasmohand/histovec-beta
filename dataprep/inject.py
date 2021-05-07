#! /usr/bin/env python3

import json
import csv
import argparse


def main():
    parser = argparse.ArgumentParser(description='Inject DSS data to Mongo.')
    parser.add_argument('input_filename',
        metavar='/path/to/dss_data_file.csv',
        type=str,
        help='DSS data file to inject in Mongo'
    )
    args = parser.parse_args()
    print('Converting csv file to json...')



    output_filename = args.input_filename.replace('.csv', '.json')
    data = []
    with open(input_file, "r") as fh:
        csv_reader = csv.reader(fh, delimiter=',', quotechar='"')
        first_line=True
        for line in csv_reader:
            if first_line:
                data_keys = line
                first_line = False
            else:
                data_line = {}
                for value in line:
                    if data_keys[line.index(value)] in ('sit_adm', "historique", 'pve'):
                        data_line[data_keys[line.index(value)]] = json.loads(value)
                    else:
                        data_line[data_keys[line.index(value)]] = value
                data.append(data_line)
                data_line = None
    with open(output_file, "w") as fh:
        json.dump(data, fh)

    if import
    print("Run command: ")
    print("mongoimport %s -c=histovec -d=local  --drop --type=json --jsonArray" % output_file)


if __name__ == "__main__":
    main()
