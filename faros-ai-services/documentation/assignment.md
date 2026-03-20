We would like you to develop a service that computes and serves a Word Cloud for Amazon product descriptions. See the attached PDF for a detailed problem description.

E.g.

1. GET /wordcloud?top=X - returns the top X significant terms in the word cloud. This API has to be fast to invoke.
2. POST /wordcloud?url=X - submits a product page URL for processing and updates the word cloud.

Here is a handy script to test your solution. Feel free to add additional tests as needed.

At any time, feel free to email me, Matthew, Will or Yandry (cc-ed on this email) with any questions you have and we will try to answer them as quickly as possible.

Assignment Details:
Amazon Product Descriptions
Word Cloud
Last Edited ByMMatthew Tovbin
Last Edited Time
Stakeholders
This task involves you developing a web crawler that generates a word cloud of
the most interesting words in the product descriptions people view on Amazon.
The system will get requests with Amazon URLs of products (for example:
http://www.amazon.com/gp/product/B00VVOCSOU) through a REST endpoint
that you need to develop, will go to these pages and extract the product
descriptions for it and create a word cloud with the most common and interesting
words in the descriptions.Feb 29, 2020 110 AM
Amazon Product Descriptions Word Cloud2Technical Details
 You can assume that the load of the of the requests is about 1/sec, but make
sure that
your design can support a load several orders of magnitudes larger than that.
 The list of URLs will be provided through a set of CURL calls. Please use
simulateRequests.sh script to simulate those requests while you develop.
For example you can run it as follows: ./simulateRequests.sh localhost 8080
productUrl 1Example of a product description. Please notice that the description is the section that starts
with “Enjoy The Creative Life”Example of a Word Cloud
Amazon Product Descriptions Word Cloud3 URLs might repeat themselves, and as with any good engineering system, we
would like
to avoid fetching the same page over and over again.
 Assume the word corpus can be very large, so a naive calculation of all the
top words in
the corpus will not be quick enough to render promptly on the page. You will
need to
address it either through the algorithm, data structures or technology.
 We would want to avoid having very common words in the word cloud (e.g. a,
the, is).
 This is not a front end development assignment, please don’t spend too much
time on making the word cloud pretty. It’s ok, if it’s even a textual
representation of the data
powering the word cloud.
Assignment Review Details
This assignment is a test of your systems engineering skills more than your
coding skills. Therefore while we would like to see clean and organized code, it is
more important that the system is built with the right components, can scale well,
and you will be able to explain every design decision that you have made building
this system.
