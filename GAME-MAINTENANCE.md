# Finding and populating answers list

Word corpus from SMC : https://gitlab.com/smc/corpus

The process is done with the help of VSCodium and terminal. At the end of the process, you'll get a file of words on each line from which some can be manually picked to populate answers array in game.

## Process

Reverse transliterate words in a file :
```
while read in; do varnamcli -s ml -reverse "$in" | sed -n 2p | awk '{print $1;}' >> out.txt; done < nouns.txt
```

Some regex utilities:
```
FROM
TO
```

* Remove words greater than 5 char
```
^.{6,100}.*

```

* Remove words lesser than 5 char
```
^.{1,4}\n
\n
```

* Remove words with non alphabetic characters in it:
```
^.*[~_-]{1,5}.*

```

* Remove words with capital letters in it (case sensitive regex):
```
^.*[A-Z].*\n
\n
```

* Replace empty lines (repeatedly do this):
```
\n\n
\n
```

TODO : Sort file based on popularity of word (use Varnam DB for this)

WIP :
```
while read in; do varnamcli -s ml "$in" | sed -n 1p | awk '{print $1" "$2;}' >> out.txt; done < out.txt
```

## Miscellaneous

Find duplicates in answer array:
```js
console.log(
  answers.filter((item, index) => index !== numbers.indexOf(item))
);
```