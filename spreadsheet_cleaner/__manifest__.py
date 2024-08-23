# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': "o-spreadsheet json file cleaner",
    'version': '1.0',
    'category': 'Hidden',
    'summary': 'o-spreadsheet json file cleaner',
    'description': 'o-spreadsheet json file cleaner',
    'depends': ['spreadsheet_edition'],
    'installable': True,
    'auto_install': True,
    'license': 'LGPL-3',
    'assets': {
        'spreadsheet.o_spreadsheet': [
            'spreadsheet_cleaner/static/src/**/*.js',
        ],
    }
}
