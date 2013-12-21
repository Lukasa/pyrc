#!/usr/bin/env python

import os
import sys

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

if sys.argv[-1] == 'publish':
    os.system('python setup.py sdist upload')
    sys.exit()

packages = [
    'repeater',
]

requires = ['tornado']

readme = "Not right now."
history = "Still no."
license = "Nope, not yet."

setup(
    name='repeater',
    version='0.0.1',
    description='Repeater',
    long_description=readme + '\n\n' + history,
    author='Cory Benfield',
    author_email='cory@lukasa.co.uk',
    url='https://lukasa.co.uk/',
    packages=packages,
    package_dir={'repeater': 'repeater'},
    install_requires=requires,
    license=license,
    zip_safe=False,
    classifiers=(
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'Natural Language :: English',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.3',

    ),
)