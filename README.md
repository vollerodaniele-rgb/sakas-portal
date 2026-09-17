# clients.noiraunoir.com forwarder

This repo used to hold the first standalone Sakas portal (sakas.noiraunoir.com).
That copy is retired; its files are still in the history of the `main` branch.

Since September 2026 the portal site lives on **noiraunoir.com**, and this repo
only answers on `clients.noiraunoir.com`, sending every request to the same
path and `#fragment` on the new domain. `index.html` and `404.html` are the
same file on purpose: Pages serves 404.html for every path it does not have.
