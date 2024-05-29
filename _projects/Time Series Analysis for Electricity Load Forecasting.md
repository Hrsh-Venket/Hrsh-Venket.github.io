---
layout: page
title: Time Series Analysis for Electricity Load Forecasting
description: A report on work I did with Pranit Sinha on contest for electricity load forecasting.
img: assets/img/The Merchant of Mareechikoor/title page.png
importance: 1
category: work
related_publications:
---

Link to Github: https://github.com/pranit-sinha/eeg

For this ISM we participated in an ML competition. Beyond the learning associated with participation, our goal coming into the ISM was to place top 15 among what we expected to be 150 participants. We eventually placed 24th out of 200. We further were able to achieve better accuracy 10 days after the competition had ended, which would have likely put us in the top 10.

# Problem

Our problem was Electricity Load Forecasting:

Given electricity usage data for 201 houses at a granularity of 15 minutes from 2018 Jan 1 00:00 to 2018 December 22 00:00.

Our goal was to predict the best 4 hour window from 5 PM to 12 PM in the last 10 days of December, where ‘best’ is the time that minimises total electricity use in House 1 of our dataset.

# Solution

We treated the problem as 2 sub problems. First was the task of prediction, and second was the task of finding the best 4 hour window.

We solved the second problem by writing a few simple lines of code to find the minimum subsequence sum for each of the 10 days, and to pick the overall minimum.

The first problem however proved to be a lot more complicated.

## Model

We first looked at which models performed well with Tabular Time series Data, finally arriving at Gradient Boosted Decision Trees (XGBoost). In many similar competitions for load forecasting (cf. this link) it outperformed LSTMs and other common models used for Time series Analysis.


Since it can also be parallelised the model can train relatively fast on our large dataset, and can allow us to finetune and quickly iterate on our predictions, as is often necessary for such competitions. We used the CatBoost library for its robustness. The winning submission for the competition also used GBDT, but instead used Light GBM.

### Baseline

As a baseline, we fed all numerical data from the dataset into the classifier ‘as-is’. While, as expected our accuracy was poor throughout (MSE around 0.5 on average), our accuracy was lower for certain periods of the year, especially the last 10 days of the year.

To that end, we guessed that this was a near out of distribution problem. We expect that this is because we are predicting in ‘christmas season’ a holiday time which looks very different from any other time of year in terms of electricity usage. 

We also noticed that our naive baseline was performing worse than simply predicting that the last ten days would all be identical to December 21st. This is because of issues with datetime encoding. While originally our data was given to us as year, month, day, hour, minute, encoding these independently did not allow our model to learn the relationship between them.

Further, we noticed that predictions were as good for the target house as they were for the other houses. This means, it was not weighing the ‘house column’ sufficiently when predicting.

### Encoding

Datetime

Our objective with encoding datetime was to make sure that the cyclical idea of time encoding was encoded. For instance, to encode hours, we needed the model to understand that 00 is right next to 23. Similarly for minutes that 00 is right next to 59. We attempted to resolve this by mapping values to a sine function as detailed here but finally realised that pandas’ datetime encoding ultimately accomplished this, and allowed us to account for week as well. This latter detail was important since weekends would have higher household electricity usage than weekdays.

Given these improvements for datetime encoding, we had substantially better accuracy throughout the year, although the out of distribution issues for the last 10 days were still not solved.

### House

As our next step, we realised that to make the model significantly weight ‘house’ information we could not simply give each house a random number from 1 to 200. This is mainly because there was no relationship between house number and how useful it was at prediction. Further, one-hot encoding houses would still not make this be useful since no one column would be given high feature importance since information from these columns would be so sparse.

Thereby, we decided to use a similarity metric to give each house a value based on how similar it was to the target house we needed to do prediction on. Our metric for this was simply euclidian distance between electricity usage on each interval across the year. This gave the ‘house’ column some meaningful information: how similar the given house was to our target house. 

This encoding alone substantially improved our performance throughout the year.

After the aforementioned two improvements however the model’s performance was only marginally better than what we might manually predict by looking at the last few days of december for the last house.

### Near Out-of-Distribution Problem

Our feature engineering attempted to extract the maximal usable information from the collection of features available to us. However, none of what we had done so far had helped us account for the difference in performance over the last 10 days especially. We first guessed that it would be a good idea to provide information to the model that we were predicting load values for a time period coinciding with the holidays, which we hypothesised would imply a distinct uptick in electricity usage. We therefore added a binary feature to the dataset denoting whether each day was a holiday. However, likely because the pattern for holiday usage was not actually very distinct from weekends, this did not improve the accuracy of our inferences. 

We then realised that the weather may have also heavily correlated with this change as winter in Boston only starts at the end of December.

### Weather Data

We decided that rather than summarising information already captured within the features, it would be more beneficial to incorporate external sources of data. We embarked on a search for historical weather data for the Boston region in 2018.

The contest suggests interfacing with different weather APIs using RTDIP, but all the APIs we found required a fee for a number of tokens. We tried alternative methods and eventually managed to scrape the data from a commercial weather database.

### Web Scraping

Scraping the data was slightly non-trivial given that the commercial sites we looked at all had security policies that blocked automated requests for viewing data. We eventually used Selenium and BeautifulSoup to write a script that opened page sources as BS objects, searched for the lib-history-table, used an html parser to acquire the unstructured data, and then structured it into a readable csv format for us to directly include in our dataset. Since one of the weather stations reported pressure data as sea-level pressure while the other reported absolute pressure, we back-calculated the former to absolute pressure using a barometric reduction using the station’s 12-hr temperature and humidity history.

### Combining datasets

This data included the typical information about temperature and precipitation at an hourly granularity, which was good enough for our dataset.

However, this hourly granularity had a large number of gaps and contained some inconsistencies (ie. reading at 8 AM on one day and 8:25 AM on another day, etc). Thereby, we needed to attach this information to our dataset. We expected that only temperature, wind speed and similar parameters would be useful. Therefore, we interpolated the existing data and matched it against each of our columns at the 15 minute granularity. We used linear interpolation for this and while we could have used a more complex algorithm to estimate values at intermediate points, we expect that at this granularity the difference would not be too large.

Capturing this information was able to greatly improve our prediction accuracy. Since the contest had ended by the time we managed to get the weather data, we could not test it against the last 10 days, however our prediction accuracy when testing on folds at different points across the year was a lot more uniform when incorporating weather.

As we wrote this report, we noticed from the winning submission that they found some patterns in the data that worked well, including the observation that heating load would spike around thresholds of 10 and 15 degrees. They also noticed that plug loads increased substantially around the december temperature drop.

## Results

As we mentioned, we finally ended up at the 24th position with an RMSE of 0.0664. 

The top three predictions had scores of: 0.0097, 0.0113, 0.0124

After incorporating the weather data, our k-fold accuracy across the training set was 0.016. While this was in-distribution accuracy and accuracy for the testing set would likely have been higher, our changes brought us between the accuracies of the 7th and 8th place predictions.

## Work Beyond the Competition

After the competition deadline passed, we also worked on replicating the results from a paper on Monsoon rainfall prediction co-authored by Prof. Juneja. While the authors used LSTM and Autoformer models, we trained a CNN on 100-year daily gridded precipitation data from the Indian Meteorological Department in order to try and capture the information inherent to the proximity of grid points. We achieved accuracy similar to the Numerical Weather Prediction forecasts obtained from the NCEP in predicting rainfall for all regions of India except the Northeast.
We also read and discussed the papers wherein the various models we came across had been proposed, such as the papers on autoformers,GBDTs,and LSTMs.

Overall, from this ISM we have learnt:
Important lessons about encoding information for the specific task at hand
The importance of creating a baseline model and trying to understand the reasoning behind manual prediction
The practical considerations of such contests and the ability to iterate and improve upon predictions
The technical details of collecting data e.g through scraping, and processing geoscience specific data formats like the NetCDF format
