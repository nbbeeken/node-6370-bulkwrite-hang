# node-6370-bulkwrite-hang

An attempt at reproducing the issue described in https://jira.mongodb.org/browse/NODE-6370

## How to run

```sh
npm test
```

## Steps

1. setup.mjs will run first dropping the "sink" collection
  1. setup.mjs will populate "source" if it does not have `totalDocumentCount` documents (defined in shared.mjs)
1. main.mjs will accumulate 10k documents from "source" and create a bulkWrite `Promise` without awaiting it
1. when the cursor is exhausted all bulkWrite promises are awaited

## Expected output

Both scripts should complete (~30 mins).

```txt
> node-6370-bulkwrite-hang@1.0.0 pretest
> node setup.mjs

reset sink...
reset sink... done.
check source...
source has 5000 documents...
reset source...
Each document is 8214 bytes
Total insertion amount is 8.214 GB
Inserting 1000 documents 1000 times...
inserted 100000 documents
inserted 200000 documents
inserted 300000 documents
inserted 400000 documents
inserted 500000 documents
inserted 600000 documents
inserted 700000 documents
inserted 800000 documents
inserted 900000 documents
inserted 1000000 documents
source finally has 1000000 documents...

> node-6370-bulkwrite-hang@1.0.0 test
> node main.mjs

finding 1000 documents per batch from source
moved 100000 documents to sink
moved 200000 documents to sink
moved 300000 documents to sink
moved 400000 documents to sink
moved 500000 documents to sink
moved 600000 documents to sink
moved 700000 documents to sink
moved 800000 documents to sink
moved 900000 documents to sink
moved 1000000 documents to sink
waiting for 1000 bulkWrites to complete
sink has 1000000 documents
```
