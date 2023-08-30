# Pairwise indexed PAF proposal

## Prepare data

```bash
git clone git@github.com:cmdcolin/pairwise_indexed_paf
cd pairwise_indexed_paf
./process.sh in.paf > out.paf
bgzip out.paf
tabix -s1 -b3 -e4 out.paf.gz
```

### Basic concept

PAF files are difficult to "index" by traditional tools like genome browsers
which like to load a subset of the data. Whole genome alignments in PAF format
between eukaryotic genomes are frequently hundreds of megabytes with CIGAR
string data included, and even with gzipping, the genome browser has to
uncompress it in memory to process.

In my view, a genome browser should be able to "query the PAF in both
directions". Therefore, if a user is browsing e.g. BRCA1 on the human genome,
they should be able to load a small amount of the PAF file to find the matching
position on mouse. Similarly if they are on mouse, they should be able to go in
the other direction. Even though a PAF has specific notions of "query" and
"target", I still want to be able to navigate in both "directions".

This repository proposes two processes to aid subsetting large whole-genome
alignments using simple tabix tools

### Strategy 1. Create two copies of the PAF data in a single file, with separate "tabix name spaces"

1. Create copy of PAF with the letter 'q' pre-prended to all lines
2. Create another copy of the PAF, with the query and target swapped (e.g.
   columns 6-9 become columns 1-4 and vice versa), with the letter 't'
   pre-pended to all lines
3. Append step 1. and step 2. together into a single file
4. Sort by column 1 and 3, and tabix index

This creates a single file where a user can query in either direction. They will
know which "direction" they are querying, so can prepend the letter q or t to
the refName they are querying.

### Strategy 2. Create an "overview" file, with a reduction in the granularity of the CIGAR string (not implemented here yet)

If we are trying to look at a "whole genome overview dotplot" for example, the
index will not help us (the index primarily helps small data when viewing a
particular region) because we have to load the entire dataset anyways. But we
can create a "reduced" version of the PAF that essentially deletes single
basepair indels from the CIGAR string, retaining some of the larger features.

But we cannot just delete from the CIGAR string and expect the coordinates to
still match up. This is why one strategy I have considered currently is to split
features when there is a "large enough" CIGAR feature (large 100kb insertion or
deletion for example), and then delete the CIGAR string entirely from all
features. You could try to retain the CIGAR, but may be lying about the exact
per-base location of certain events, which is risky in terms of data accuracy

### Footnote

PAF is a very pairwise format, however, doing a similar thing with MAF may also
be desirable. It might be that putting all the re-ordered MAF data in a single
e.g. tabix file may be an overload, but making it into N files for each element
of the multiple alignment may be reasonable.
