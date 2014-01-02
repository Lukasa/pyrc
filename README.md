# PyRC: Web-based IRC, the minimal way.

IRC is still a widely-used, popular technology for online chat. PyRC is a
service that provides access to IRC, directly from your browser.

Want to try it? Hop over to [the PyRC main page](http://pyrc-web.com/) and give
it a spin.

## Important Warning

PyRC is currently under active development and is in early beta. There are lots
of features missing, plenty of bugs, and a general lack of maturity. If you are
interested in using it, by all means feel free, and please report any bugs you
encounter. Just be aware of the bugginess of the service.

## Why PyRC?

There are plenty of alternatives to PyRC. Many of them are not directly
competitors, providing applets (written in things like Flash) that run in your
browser and provide client-side connections to IRC servers. PyRC doesn't do
that.

However, there are definitely competitors. The most well-known and most
directly equivalent is [Kiwi IRC](https://kiwiirc.com/). Like PyRC, Kiwi has
a client-server model, where the server translates from websockets into TCP
that it sends to the relevant IRC server. Like PyRC, Kiwi is open-sourced. And
like PyRC, Kiwi provides access to a default install.

The differences between PyRC and Kiwi are:

1. Kiwi is licensed under a significantly more restrictive open-source license.

   Kiwi uses the [GNU Affero GPL](http://opensource.org/licenses/AGPL-3.0).
   PyRC, conversely, uses the less restrictive
   [MIT License](http://opensource.org/licenses/MIT). Leaving aside any
   discussion about the relative benefits of these licenses, this is a reason
   to choose PyRC over Kiwi or vice-versa.

2. PyRC is less mature.

   Kiwi had been under development for more than two years at the time that
   PyRC was started. Kiwi has had more contributors, and has had vastly longer
   to work out any of its bugs and kicks, and to add more features.

3. PyRC is lighter.

   Kiwi has a large feature set that allows it to be a very fully-featured IRC
   client. PyRC does not. PyRC will likely never have as large a feature set as
   Kiwi: lots of features is not a design goal of PyRC. IRC features will be
   sacrificed on the altar of simplicity.

   Additionally, the server-side of PyRC is very light indeed, consisting of
   less than 200 lines of code. This _should_ mean that PyRC scales very well
   indeed, though in practice this has not yet been investigated.

## Installing PyRC

Detailed installation instructions will come later, ideally along with
Fabric scripts (or the equivalent) for easy bootstrapping. In the meantime, the
following dependencies are required:

- Python 3.3+
- Tornado
- nginx

`supervisord` is also strongly recommended.

To get hold of the code, simply clone the master branch of the GitHub
repository. Then, add the PyRC directory to your `PYTHONPATH`, then run

    python3 -m repeater.server --port=8000

This should start a PyRC server on localhost, port 8000. This server will serve
static files itself. In production, this server should be behind an nginx
reverse-proxy that will serve the needed static files instead.

Configuring the nginx server is left as an exercise to the unlucky reader at
this point in time, though if you ask @Lukasa for help he'll happily provide
the config being used on the example server.
