---
layout: post-layout.njk
title: How to make coffee using JavaScript
description: 
date: 
tags: ['post', 'JavaScript', 'coffee', 'code example']
topics: ['Promises', 'async/await', 'JavaScript']
---

# Using async/await in JavaScript (JS) or how I make coffee

As I've noted in my [uses post](/uses), cold brew is my number one coffee choice.
I don't like hot drinks, so I don't immediately reach for hot coffee when I need some caffeine.
Instead, I go for something like cold brew, or icing down hot coffee instead.

Unlike the other forms of coffee I've listed, cold brew takes _significantly_ more time to make!
Once it is ready though, it's simple as pouring some coffee from a carafe into your mug of choice.
Unlike hot coffee, it can be stored in your fridge for a few weeks without the brew losing its flavor.
This allows me to batch up an entire week's worth of coffee at one time, instead of having to make a new cup every day!

Since the majority of the time spent preparing cold brew is idle time, I figured this would be a good example for explaining synchronous vs asynchronous tasks!
This post was definitely spurred on because of [my recent work of dealing with performance issues when importing a large amount of logins in the Firefox password manager](https://bugzilla.mozilla.org/show_bug.cgi?id=1701660).
I believe that learning how to diagnose and work through these kind of problems will make you a very effective developer, since this issue isn't particularly novel in any way.
Now, let's see why dealing with asynchronous tasks are complicated and see why we default to synchronous tasks. 

## Dealing with asynchronous tasks is complicated

Knowing when a task is going to complete is very important in developing applications, libraries, user interfaces, and many other areas in software.
If I gave you this code snippet

```js
function main() {
  console.log("hello world!");
}

main();
```
you would know that once the console prints "hello world", the program would finish.
The actual running time would depend on the machine you ran this code snippet on, but we can safely assume the snippet would run quickly.
If some other part of the codebase was dependent on `main()`, then we could safely wait for `main()` to return without blocking the entire program for very long (if at all).

What if, instead, we had a code snippet like this

```js
function main() {
  let randomNumber = Math.floor(Math.random() * 7500);
  setTimeout(() => console.log("hello world"), randomNumber);

}

main();
```
we still know that once the console prints "hello world", the program would finish...but we no longer know how long it will take to print "hello world"!
Almost contradictory in a sense, `main()` **would finish and keep executing functions** in this snippet before "hello world" was ever printed.
If the rest of our snippet needed to know that "hello world" was printed, then this pattern would not work at all!
Additionally, since we don't know how long it will take to run `main()`, we could potentially hang up the entire program if we **really** need to wait for this console log!

Later on, we'll see how to shift our thinking so that we can determine when we _really_ need to wait for tasks to finish versus coming back to a completed deferred task and using its returned value.

## We perform many of our tasks in an [async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) pattern

To help determine when to break up tasks into asynchronous pieces versus when we can't break up tasks, it's helpful to think of how we deal with this problem on a daily basis.
Many daily or weekly tasks are comprised of a bunch of asynchronous steps that we utilize to take full advantage of our time.
A few examples off the top of my head, doing laundry, cooking dinner, commuting to work, and plenty of others that I'm not thinking of at this moment.
At any rate, let's break down my few examples so we can start to see the async/await pattern in this.

Doing laundry is comprised of some synchronous tasks and asynchronous tasks.
By organizing the steps in such a way that minimize our idle time, we can be more efficient in this chore.
Since there's only one of you, we can only do one active task at a time and so we should determine what our active, or blocking, tasks are.
Personally, I've always had access to a washing machine and dryer, which changes up the task structure compared to hand washing...but let's explore both cases.

For the case of a washing machine and a dryer, my ordered steps would look like this:
- Gather dirty laundry
- Put dirty laundry in washing machine
- Add detergent
- Start washing machine
- Wait for washing machine to finish
- Move laundry to dryer
- Start dryer
- Wait for dryer to finish
- Gather clean laundry
- Fold laundry
- Put away laundry


A few of these steps involve waiting, or blocking, tasks.
I cannot do the following steps after a "wait" until that task lets me know that it has completed!
We need to keep this in mind, since there are certain steps that _must be completed in order_.
If I followed [JS event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) rules and I didn't want to block, I could throw an async in front of each of these steps and hope for the best.
Unfortunately, this isn't going to achieve the series of steps I need for the `laundry()` task to be successful!
What would end up happening could look something like this instead:
- Gather one piece of dirty laundry
- Put this one piece in washing machine
- Add detergent
- Start washing machine
- Move non-existent laundry to dryer
- Start dryer
- Start folding non-existent clean laundry
- Put non-existent clean laundry away
This sequence is **definitely** not the way to do laundry!
We need to wait when the steps tell us to wait, but we don't need to _actively wait_ for this task to finish...we can do other things in the mean time!

For the other case, hand washing and hand drying, let's see where things differ and where things are similar:
- Gather dirty laundry
- Get water for wash basin
- Add soap/detergent
- Start washing
- Finish washing 
- Hang laundry out to dry
- Wait for laundry to dry
- Gather clean laundry
- Fold laundry
- Put away laundry
The major difference is that washing is a blocking task now, but we can start the drying process immediately when we are done with one piece of laundry unlike in the washing machine case.
As with the washing machine case, we can't simply throw an async in front of these steps and get the exact result we want!
However, we can get some other work done during the "hang laundry out to dry" step.

To really exaggerate the point, let's see how much time we would waste if we needed to synchronously brew cold brew!

## Brewing cold brew would be a terrible synchronous task

Given what we know about breaking a task down into sub-tasks, let's do the same for brewing cold brew:
- Get coffee beans
- Grind coffee beans
- Put ground coffee into filter
- Put filled filter into carafe
- Fill carafe with water
- Store in fridge

For those of you who are unfamiliar with cold brew brewing, the majority of these steps look pretty similar to other brewing methods.
The major difference though, is the temperature of the water we're using to brew the coffee.
As the name implies, we are using cold water, not hot water!
Hot water, essentially, extracts the flavor and caffeine from the ground coffee almost instantaneously...while cold water absolutely does not extract instantaneously.
While the entire process of making hot coffee is a few minutes, the [entire process of making cold brew is a minimum of **12 hours**](https://www.simplyrecipes.com/recipes/how_to_make_cold_brew_coffee/).

If we made cold brew synchronously, we would need to stay awake and idle in front of the fridge for a minimum of 12 hours!
This is an absolute waste of time and resources, there has to be a better way.
In this case there is, we can break some of these tasks up into asynchronous pieces and work on other active tasks while waiting for async tasks to finish up.

## Using promises and async/await is a wonderful way to make cold brew

In order to show how the asynchronous process would look in code, let's first start with creating functions for these steps.

```js
async function getCoffeeBeans() {
  console.log("Grabbing a bag of coffee");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("Grabbed a bag of coffee")), 5000);
  });
}

async function loadCoffeeGrinder() {
  console.log("loading coffee grinder");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("loaded coffee grinder!")), 3000);
  });
}

async function grindCoffeeBeans() {
  console.log("grinding coffee beans");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("coffee grinder is finished")), 12000);
  });
}

async function moveGroundCoffeeToFilter() {
  console.log("filling filter with ground coffee");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filter filled with coffee")), 5000);
  });
}

async function putFilterInCarafe() {
  console.log("loading carafe with filter");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filter placed!")), 2000);
  });
}

async function fillCarafeWithWater() {
  console.log("filling carafe with water");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("carafe is filled!")), 30000);
  });
}

async function storeCarafeInFridge() {
  console.log("storing carafe in fridge");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("carafe stored")), 5000);
  });
}

async function waitForBrew() {
  console.log("brewing has begun!");
  // In real life, this timeout would be 43,320,000 millseconds!
  // But for demonstration purposes, we'll set this to 2 minutes
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("brewing is done")), 120000);
  });
}

async function makeColdBrew() {
  console.time("cold brew time");

  console.time("get coffee beans");
  await getCoffeeBeans();
  console.timeEnd("get coffee beans");

  console.time("load coffee grinder");
  await loadCoffeeGrinder();
  console.timeEnd("load coffee grinder");

  console.time("grind coffee beans");
  await grindCoffeeBeans();
  console.timeEnd("grind coffee beans");

  console.time("move ground coffee");
  await moveGroundCoffeeToFilter();
  console.timeEnd("move ground coffee");

  console.time("put filter");
  await putFilterInCarafe();
  console.timeEnd("put filter");

  console.time("fill carafe");
  await fillCarafeWithWater();
  console.timeEnd("fill carafe");

  console.time("store carafe");
  await storeCarafeInFridge();
  console.timeEnd("store carafe");

  console.time("wait for brew");
  await waitForBrew();
  console.timeEnd("wait for brew");

  console.timeEnd("cold brew time");
}

let readyCoffee = await makeColdBrew();
```

Now given this snippet, we have the async/await keywords and other things that should magically make this process asynchronous and more time effective...right?
Unfortunately, not really.
While we've freed ourselves up if we have other high-level tasks happening, the actual `makeColdBrew` process is effectively synchronous.
But how is it synchronous? 
We added all the async/await steps so it should run asynchronously and free us up right?
Unfortunately, this is not the case...we have to wait for each subtask to finish before moving on to the next one in our `makeColdBrew` function.
Additionally, our cold brewing process is interrupted during each sub-task, if we've queued up some other tasks during our main loop!
So while we're never blocked on our main thread now, which is a huge improvement compared to waiting 12 hours for the brew to finish, we aren't efficiently running through our cold brew process!
Let's see what we can do to improve this, and we'll measure if we're making improvements or not by utilizing `console.time()`. Given this current implementation, it takes us **182 seconds to make our cold brew!**

Something we've noticed is that we don't need to wait for the filter to be in the carafe before filling it with water, so let's add a `partiallyFillCarafeWithWater()` function so we spend less time waiting for all the water to flow though our ground coffee.

```js
async function partiallyFillCarafeWithWater() {
  console.log("Adding some water to carafe!");
  await setTimeout(() => console.log("added some water."), 3000);
  return true;
}
async function fillCarafeWithWater() {
  console.log("filling carafe with water");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("carafe is filled!")), 27000);
  });
}
```
Since we don't need to get the coffee beans or grind them before adding _some_ water to the carafe, let's reschedule our tasks a bit

```js

async function makeColdBrew() {
  console.time("make cold brew");
  await getCoffeeBeans();
  await loadCoffeeGrinder();
  let grindCoffeeStep = grindCoffeeBeans();
  let partiallyFillWithWaterStep = partiallyFillCarafeWithWater();

  // This allows use to use the idle time in the grindCoffee step
  // to go ahead and fill the carafe with some water
  await Promise.all([grindCoffeeStep, partiallyFillWithWaterStep]);
  await moveGroundCoffeeToFilter();
  await putFilterInCarafe();

  // Since we partially filled the carafe with water, this step will be shorter
  // than the previous implementation
  await fillCarafeWithWater();
  await storeCarafeInFridge();
  await waitForBrew();
  console.timeEnd("make cold brew");
}

let readyCoffee = await makeColdBrew();
```

One thing you'll notice in your console with this updated implementation is that "Adding some water to carafe!" immediately follows "Grabbing a bag of coffee", instead of "grabbed a bag of coffee". This is because of the asynchronous nature of the `getCoffeeBeans()` and `partiallyFillCarafeWithWater()` functions.
JavaScript calls `getCoffeeBeans` which immediately logs "Grabbing a bag of coffee" and returns a Promise.
Then we call `partiallyFillCarafeWithWater` which immediately logs "Adding some water to carafe!" and returns a Promise.
Since the promise returned by the carafe resolves quicker than the beans promise, we end up logging "added some water" before "Grabbed a bag of coffee".


In this case, we're going to measure the overall time and compare to our previous implementations. The synchronous implementation, given that the example brew time is two minutes, would take 180 seconds of blocking time.
If we were using the true brew time, it would take 12+ hours of blocking time.
In the first asynchronous implementation, again knowing that the example brew time is two minutes, would take 180 seconds of _non-blocking time_.
Because of this, we can squeeze in other high-level tasks during these idle moments during the 180 seconds, which is a massive improvement over having to wait and do nothing for 3 minutes.
In our second asynchronous implementation, we were able to shave off three seconds due to scheduling other sub-tasks during idle periods in the `makeColdBrew` process.
If my math is right, and it probably isn't, that's only a 1% increase of performance over our first asynchronous implementation...not that great in my opinion.

Given this particular way of making coffee, we aren't able to optimize a lot of the steps since we have so many steps that *have to happen* in order!
We still massively increased the experience of making cold brew though, so that's a success in my opinion!
I think my process for making iced coffee will be a better example of having a few asynchronous tasks running at the same time and how that increases performance.

## Speeding up the iced coffee process

As before, let's go ahead and define the steps I take to make iced coffee

```js
async function getCoffeeBeans() {
  console.log("Grabbing a bag of coffee");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("Grabbed a bag of coffee")), 5000);
  });
}

async function loadCoffeeGrinder() {
  console.log("loading coffee grinder");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("loaded coffee grinder!")), 10000);
  });
}

async function grindCoffeeBeans() {
  console.log("grinding coffee beans");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("coffee grinder is finished")), 25000);
  });
}

async function moveGroundCoffeeToFilter() {
  console.log("filling filter with ground coffee");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filter filled with coffee")), 6000);
  });
}

async function putFilterInCoffeeMaker() {
  console.log("putting filter back in coffee maker");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filter added to coffee maker")), 5000);
  });
}

async function fillMugWithWater() {
  console.log("filling mug with water for coffee maker!");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filled mug with water")), 20000);
  });
}

async function loadCoffeeMakerWithWater() {
  console.log("filling coffee maker with water");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("filled coffee maker with water")), 7000);
  });
}

async function addIceToMug() {
  console.log("grabbing ice for mug");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("added ice to mug")), 13000);
  });
}

async function startCoffeeMaker() {
  console.log("starting coffee maker");
  return new Promise(resolve => {
    setTimeout(() => resolve(console.log("coffee maker is done!")), 60000);
  });
}

async function makeIcedCoffee() {
  console.time("make iced coffee");
  console.time("get coffee beans");
  await getCoffeeBeans();
  console.timeEnd("get coffee beans");

  console.time("load coffee grinder");
  await loadCoffeeGrinder();
  console.timeEnd("load coffee grinder");

  console.time("grind coffee");
  await grindCoffeeBeans();
  console.timeEnd("grind coffee");

  console.time("move coffee");
  await moveGroundCoffeeToFilter();
  console.timeEnd("move coffee");

  console.time("put filter");
  await putFilterInCoffeeMaker();
  console.timeEnd("put filter");

  console.time("mug water");
  await fillMugWithWater();
  console.timeEnd("mug water");

  console.time("coffee maker water");
  await loadCoffeeMakerWithWater();
  console.timeEnd("coffee maker water");

  console.time("ice mug");
  await addIceToMug();
  console.timeEnd("ice mug");
  
  console.timeEnd("make iced coffee");
}

let readyCoffee = await makeIcedCoffee();

```

Following along in the console, we see that it takes around 91 seconds for this entire process to occur.
Again, let's see if we can break up some of these tasks into independent subtasks.


```js
async function makeIcedCoffee() {
  console.time("make iced coffee");
  await getCoffeeBeans();
  await loadCoffeeGrinder();

  // Since grinding coffee is a longer running task
  // I can do some other independent synchronous tasks
  // at the same time!
  let grindCoffeeStep = grindCoffeeBeans();
  await fillMugWithWater();
  await loadCoffeeMakerWithWater();
  await addIceToMug();
  await grindCoffeeStep;

  // After the water is added to the coffee maker
  // and I have ice in the mug
  // I can add the filter back to the maker
  // and start the brewing process
  await moveGroundCoffeeToFilter();
  await putFilterInCoffeeMaker();
  await startCoffeeMaker();
  
  console.timeEnd("make iced coffee");
}

let readyCoffee = await makeIcedCoffee();
```

If you're following along, you may have noticed that our total time _actually_ increased to 126 seconds in this scenario!
Let's dig in and find out why.
My initial hunch is that there's an overhead we're paying by sending these tasks to other threads to complete.
No calculation we do is free unfortunately.
Let's go ahead and try to fix this.


```js

async function coffeeSteps() {
  await getCoffeeBeans();
  await loadCoffeeGrinder();
  await grindCoffeeBeans();
  await moveGroundCoffeeToFilter();
  await putFilterInCoffeeMaker();
}

async function mugSteps() {
  await fillMugWithWater();
  await loadCoffeeMakerWithWater();
  await addIceToMug();
}

```

```js
async function makeIcedCoffee() {
  console.time("make iced coffee");
  let coffeePromises = coffeeSteps();
  let mugPromises = mugSteps();
  await Promise.all([coffeePromises, mugPromises]);
  await startCoffeeMaker();
  console.timeEnd("make iced coffee");
}

let readyCoffee = await makeIcedCoffee();
```

This snippet runs at 111 seconds...so slightly better than before!
Again, no calculation is free and we're able to see that in this case.
Given that computers can perform calculations very quickly, the overhead of creating threads to then wait around is greater than simply awaiting each step in the main `makeIcedCoffee` process.
This is why measuring before and after is _a must_ when dealing with these kind of performance issues!
I would highly recommend figuring out how to use your browser's profiler in order to get better before and after metrics of your changes.

## Summary

Dealing with asynchronous tasks is difficult!
When designing applications, interfaces, user experiences, etc. we want to avoid blocking the user if we are able.
Converting your synchronous tasks to asynchronous is not a cure-all!
We saw in the iced coffee example where creating all these threads and the additional functions overhead actually caused a longer run time overall.
To be sure you're actually solving performance problems, you **must** measure before and after your changes.
Otherwise, you won't be able to tell if your changes negatively or positively impacted performance concerns.
If you can take advantage of idle time in a process, you should aim to utilize this downtime for other needed calculations.
