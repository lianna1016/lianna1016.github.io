
library(tidyverse)


fires <- read.csv("~/Desktop/Fall 2020/CS171/piazzaposse/week_12/data/California_Fire_Incidents.csv", stringsAsFactors = FALSE)
demographics <- read.csv("~/Desktop/Fall 2020/CS171/piazzaposse/week_12/data/cc-est2019-alldata-06.csv", stringsAsFactors = FALSE)

sorted_fires <- fires %>% 
  group_by(Counties) %>% 
  summarize(AcresBurned = sum(AcresBurned)) %>% 
  arrange(desc(AcresBurned)) %>% 
  filter(Counties != 'State of Oregon') %>% 
  filter(Counties != 'State of Nevada') %>% 
  filter(Counties != 'Mexico') %>% 
  filter(!is.na(AcresBurned))

worst_counties <- head(sorted_fires, 0.5*nrow(sorted_fires))
best_counties <- tail(sorted_fires, 0.5*nrow(sorted_fires))

View(worst_counties)
View(best_counties)

# note that since SF is a consolidated city-county, it doesn't appear in our dataset
# we've also filtered out the counties with no data - Riverside, San Diego, and Yolo

demographics <- demographics %>% mutate(worst50 = (str_trim(CTYNAME) %in% worst_counties$Counties))
View(demographics)

worst50_demographics <- demographics %>% 
  filter(worst50 == TRUE) %>% 
  summarize(
    TOT_MALE = sum(TOT_MALE),
    TOT_FEMALE = sum(TOT_FEMALE),
    WA_MALE = sum(WA_MALE),
    WA_FEMALE = sum(WA_FEMALE),
    H_MALE = sum(H_MALE),
    H_FEMALE = sum(H_FEMALE),
    AA_MALE = sum(AA_MALE),
    AA_FEMALE = sum(AA_FEMALE),
    BA_MALE = sum(BA_MALE),
    BA_FEMALE = sum(BA_FEMALE),
    OTHER_MALE = sum(NA_MALE) + sum(TOM_MALE) + sum(IA_MALE),
    OTHER_FEMALE = sum(NA_FEMALE) + sum(TOM_FEMALE) + sum(IA_FEMALE)
  )

best50_demographics <- demographics %>% 
  filter(worst50 == FALSE) %>% 
  summarize(
    TOT_MALE = sum(TOT_MALE),
    TOT_FEMALE = sum(TOT_FEMALE),
    WA_MALE = sum(WA_MALE),
    WA_FEMALE = sum(WA_FEMALE),
    H_MALE = sum(H_MALE),
    H_FEMALE = sum(H_FEMALE),
    AA_MALE = sum(AA_MALE),
    AA_FEMALE = sum(AA_FEMALE),
    BA_MALE = sum(BA_MALE),
    BA_FEMALE = sum(BA_FEMALE),
    OTHER_MALE = sum(NA_MALE) + sum(TOM_MALE) + sum(IA_MALE),
    OTHER_FEMALE = sum(NA_FEMALE) + sum(TOM_FEMALE) + sum(IA_FEMALE)
  )

View(worst50_demographics)
View(best50_demographics)

worst50_race <- worst50_demographics[,3:12]
best50_race <- best50_demographics[,3:12]

worst50_femalerace <- worst50_race[, grep(pattern = "FEMALE", x = colnames(worst50_race))]
best50_femalerace <- best50_race[, grep(pattern = "FEMALE", x = colnames(best50_race))]
worst50_malerace <- worst50_race[, grep(pattern = "_MALE", x = colnames(worst50_race))]
best50_malerace <- best50_race[, grep(pattern = "_MALE", x = colnames(best50_race))]

combined_race <- rbind(
  t(worst50_femalerace),
  t(worst50_malerace),
  t(best50_femalerace),
  t(best50_malerace)
)

rownames(combined_race) <- c()

race_labels <- rep(c("White", "Hispanic", "Asian", "Black", "Other"), 4)
gender_labels <- rep(c(rep("Female", 5), rep("Male", 5)), 2)
best_worst_labels <- c(rep("Most Affected", 10), rep("Least Affected", 10))

output <- cbind(best_worst_labels, gender_labels, race_labels, combined_race)

colnames(output)[4] <- "POP"

View(output)

write.csv(output, '~/Desktop/Fall 2020/CS171/piazzaposse/week_12/data/demographics_agg.csv')
